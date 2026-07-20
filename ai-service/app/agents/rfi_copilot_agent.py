"""
RFI Knowledge Copilot (Roadmap Phase 9, scoped per the PRD: a single seeded
project corpus, not multi-tenant project-aware chat).

Two entry points:
- ingest_document(): chunk + embed + store a document into the corpus (called once
  per seed document, ahead of the demo — not a live upload-and-chat-immediately flow).
- answer_question(): embed the question, retrieve the most similar chunks, and ask
  the LLM to answer strictly from those chunks, citing which document each claim
  came from. If retrieval finds nothing relevant, the LLM is told to say so rather
  than making something up.
"""

import logging

from app.core.embedding_client import embed_query, embed_texts
from app.core.llm_client import llm_client
from app.ingestion.chunker import chunk_text
from app.rag import vector_store
from app.schemas.common import RFIAskResponse, RFICitation, RFIIngestResponse

logger = logging.getLogger(__name__)

RFI_SYSTEM_PROMPT = """You are an EPC project knowledge assistant. You will be given
several excerpts retrieved from project documents (RFIs, specifications, meeting notes),
each labeled with its source filename, followed by a question.

Rules:
1. Answer ONLY using information present in the excerpts below. Do not use outside
   knowledge, even if you know the general topic.
2. If the excerpts don't contain enough information to answer, say so plainly —
   do not guess or fabricate an answer.
3. Keep the answer concise and practical (2-5 sentences), the way a project engineer
   would want it.
4. Do not repeat the excerpts verbatim at length — synthesize an answer, and the
   citations will point back to the exact source separately.
"""


async def ingest_document(filename: str, text: str) -> RFIIngestResponse:
    chunks = chunk_text(text, source_filename=filename)
    if not chunks:
        return RFIIngestResponse(filename=filename, chunks_added=0, total_chunks_in_corpus=vector_store.corpus_stats()["total_chunks"])

    embeddings = embed_texts([c.text for c in chunks], task_type="RETRIEVAL_DOCUMENT")
    added = vector_store.add_chunks(chunks, embeddings)
    stats = vector_store.corpus_stats()

    return RFIIngestResponse(filename=filename, chunks_added=added, total_chunks_in_corpus=stats["total_chunks"])


async def answer_question(question: str, top_k: int = 5) -> RFIAskResponse:
    query_embedding = embed_query(question)
    hits = vector_store.query(query_embedding, top_k=top_k)

    if not hits:
        return RFIAskResponse(
            question=question,
            answer="The knowledge corpus is empty or contains nothing relevant to this question. "
                   "Seed documents need to be ingested via /rfi-copilot/ingest first.",
            citations=[],
        )

    context_blocks = []
    for i, hit in enumerate(hits):
        context_blocks.append(f"[Excerpt {i+1} — source: {hit['source_filename']}]\n{hit['text']}")
    context = "\n\n".join(context_blocks)

    prompt = f"Retrieved excerpts:\n\n{context}\n\nQuestion: {question}\n\nAnswer the question using only the excerpts above."

    result = await llm_client.generate(prompt=prompt, system=RFI_SYSTEM_PROMPT, temperature=0.2, max_tokens=512)

    citations = [
        RFICitation(
            source_filename=hit["source_filename"],
            chunk_index=hit["chunk_index"],
            excerpt=hit["text"][:220] + ("..." if len(hit["text"]) > 220 else ""),
            similarity=hit["similarity"],
        )
        for hit in hits
    ]

    return RFIAskResponse(question=question, answer=result.text.strip(), citations=citations, source="live_llm")