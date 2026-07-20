"""
Simple fixed-size chunker with overlap. Good enough for a seeded RFI/spec corpus
at hackathon scale (tens of documents) — no need for semantic chunking here.
"""

from dataclasses import dataclass


@dataclass
class Chunk:
    text: str
    chunk_index: int
    source_filename: str


def chunk_text(text: str, source_filename: str, chunk_size: int = 1200, overlap: int = 200) -> list[Chunk]:
    """
    Splits text into overlapping chunks of ~chunk_size characters, breaking on
    paragraph/sentence boundaries where possible so chunks don't cut mid-sentence.
    """
    text = text.strip()
    if not text:
        return []

    chunks: list[Chunk] = []
    start = 0
    index = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)

        if end < text_len:
            # try to break on paragraph, then sentence, then word boundary
            boundary = text.rfind("\n\n", start, end)
            if boundary == -1 or boundary <= start:
                boundary = text.rfind(". ", start, end)
            if boundary == -1 or boundary <= start:
                boundary = text.rfind(" ", start, end)
            if boundary > start:
                end = boundary + 1

        chunk_str = text[start:end].strip()
        if chunk_str:
            chunks.append(Chunk(text=chunk_str, chunk_index=index, source_filename=source_filename))
            index += 1

        next_start = end - overlap
        start = next_start if next_start > start else end

    return chunks