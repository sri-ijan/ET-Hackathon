"""
Lightweight vector store for the RFI Knowledge Copilot — pure Python + numpy,
zero compiled/native dependencies.

Why not Chroma: chromadb pulls in chroma-hnswlib, a C++ extension with no
prebuilt wheel for every Python/OS combo (hit this exact build failure twice
on Windows — requires Visual Studio Build Tools to compile from source).
At hackathon scale (tens to low hundreds of chunks), brute-force cosine
similarity over an in-memory numpy array is sub-millisecond and needs nothing
beyond numpy, which ships prebuilt wheels for every platform. Simpler, faster
to set up, and one less thing that can break on a teammate's laptop.

Persistence: a single JSON file on disk (./rfi_corpus_store.json), so the
seeded corpus survives server restarts during rehearsal.
"""

import json
import logging
import os
import uuid

import numpy as np

from app.ingestion.chunker import Chunk

logger = logging.getLogger(__name__)

STORE_PATH = "./rfi_corpus_store.json"

_records: list[dict] | None = None  # each: {id, text, source_filename, chunk_index, embedding}


def _load() -> list[dict]:
    global _records
    if _records is None:
        if os.path.exists(STORE_PATH):
            with open(STORE_PATH, "r", encoding="utf-8") as f:
                _records = json.load(f)
            logger.info("Loaded RFI corpus from disk: %d chunks", len(_records))
        else:
            _records = []
    return _records


def _save() -> None:
    with open(STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(_records, f)


def add_chunks(chunks: list[Chunk], embeddings: list[list[float]]) -> int:
    if not chunks:
        return 0
    records = _load()
    for chunk, embedding in zip(chunks, embeddings):
        records.append({
            "id": str(uuid.uuid4()),
            "text": chunk.text,
            "source_filename": chunk.source_filename,
            "chunk_index": chunk.chunk_index,
            "embedding": embedding,
        })
    _save()
    logger.info("Added %d chunks to RFI corpus (total now: %d)", len(chunks), len(records))
    return len(chunks)


def query(query_embedding: list[float], top_k: int = 5) -> list[dict]:
    records = _load()
    if not records:
        return []

    matrix = np.array([r["embedding"] for r in records], dtype=np.float32)
    q = np.array(query_embedding, dtype=np.float32)

    matrix_norms = np.linalg.norm(matrix, axis=1)
    q_norm = np.linalg.norm(q)
    denom = matrix_norms * q_norm
    denom[denom == 0] = 1e-10
    similarities = (matrix @ q) / denom

    top_k = min(top_k, len(records))
    top_indices = np.argsort(-similarities)[:top_k]

    hits = []
    for idx in top_indices:
        r = records[int(idx)]
        hits.append({
            "text": r["text"],
            "source_filename": r["source_filename"],
            "chunk_index": r["chunk_index"],
            "similarity": round(float(similarities[idx]), 4),
        })
    return hits


def corpus_stats() -> dict:
    return {"total_chunks": len(_load())}


def clear_corpus() -> None:
    """Wipes the whole corpus. Useful for demo resets / re-seeding with fresh test docs."""
    global _records
    _records = []
    _save()
