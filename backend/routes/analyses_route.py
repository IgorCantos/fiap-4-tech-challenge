from flask import jsonify, request

from services.supabase_service import list_analyses


def register_analyses_routes(app):
    """Register analyses history routes."""

    @app.route("/api/analyses", methods=["GET"])
    def get_analyses():
        try:
            limit = request.args.get("limit", default=50, type=int)
            analyses = list_analyses(limit=limit)
            return jsonify({"analyses": analyses, "count": len(analyses)}), 200
        except Exception as e:
            print(f"Error fetching analyses: {e}")
            return jsonify({"error": "Failed to fetch analyses"}), 500
