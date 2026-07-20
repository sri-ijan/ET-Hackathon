"""
Thin wrapper around a local Chroma collection for the RFI Knowledge Copilot.

Uses a PersistentClient (writes to ./chroma_data) so the seeded corpus survives
server restarts during rehearsal — you don't want to re-ingest documents every
time uvicorn --reload restarts.
"""

import logging
import uuid

import chromadb

from app.ingestion.chunker import Chunk

logger = logging.getLogger(__name__)

COLLECTION_NAME = "rfi_corpus"
_client = None
_collection = None


def _get_collection():
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(path="./chroma_data")
        _collection = _client.get_or_create_collection(name=COLLECTION_NAME, metadata={"hnsw:space": "cosine"})
    return _collection


def add_chunks(chunks: list[Chunk], embeddings: list[list[float]]) -> int:
    if not chunks:
        return 0
    collection = _get_collection()
    ids = [str(uuid.uuid4()) for _ in chunks]
    documents = [c.text for c in chunks]
    metadatas = [{"source_filename": c.source_filename, "chunk_index": c.chunk_index} for c in chunks]
    collection.add(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)
    logger.info("Added %d chunks to RFI corpus (total now: %d)", len(chunks), collection.count())
    return len(chunks)


def query(query_embedding: list[float], top_k: int = 5) -> list[dict]:
    collection = _get_collection()
    if collection.count() == 0:
        return []
    top_k = min(top_k, collection.count())
    results = collection.query(query_embeddings=[query_embedding], n_results=top_k)

    hits = []
    for doc, meta, dist in zip(results["documents"][0], results["metadatas"][0], results["distances"][0]):
        hits.append({
            "text": doc,
            "source_filename": meta["source_filename"],
            "chunk_index": meta["chunk_index"],
            "similarity": round(1 - dist, 4),  # cosine distance -> similarity
        })
    return hits


def corpus_stats() -> dict:
    collection = _get_collection()
    return {"total_chunks": collection.count()}


def clear_corpus() -> None:
    """Wipes the whole corpus. Useful for demo resets / re-seeding with fresh test docs."""
    global _client, _collection
    if _client is None:
        _get_collection()
    _client.delete_collection(COLLECTION_NAME)
    _collection = _client.get_or_create_collection(name=COLLECTION_NAME, metadata={"hnsw:space": "cosine"})