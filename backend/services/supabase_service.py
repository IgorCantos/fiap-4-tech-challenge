from typing import Any, Optional

from supabase import create_client, Client

SUPABASE_URL = "https://iurjkahrevgpmnfthtjh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1cmprYWhyZXZncG1uZnRodGpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTAxMjE4NSwiZXhwIjoyMDk0NTg4MTg1fQ.zolsH2gAMs_geb7vAtiit_ZLpOzOKEBozo7sVkrEX2o"

_client: Optional[Client] = None


def get_supabase_client() -> Client:
    global _client

    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)

    return _client


def save_analysis(analysis_result: dict[str, Any]) -> Optional[dict[str, Any]]:
    """Persist analysis result (including LLM text) to Supabase."""
    llm_text = analysis_result.get("analysis")
    if not llm_text:
        print("No LLM analysis text to save.")
        return None

    client = get_supabase_client()

    row = {
        "transcription": analysis_result.get("transcription"),
        "emotion": analysis_result.get("emotion"),
        "emotion_confidence": analysis_result.get("emotion_confidence"),
        "llm_analysis": str(llm_text),
        "audio_features": analysis_result.get("audio_features"),
    }

    response = client.table("analyses").insert(row).execute()
    if response.data:
        return response.data[0]
    return None


def list_analyses(limit: int = 50) -> list:
    """Fetch recent analyses ordered by created_at descending."""
    client = get_supabase_client()
    limit = max(1, min(limit, 100))

    response = (
        client.table("analyses")
        .select(
            "id, created_at, transcription, emotion, emotion_confidence, llm_analysis, audio_features"
        )
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return response.data or []
