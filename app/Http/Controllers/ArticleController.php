<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Project;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index($projectId)
    {
        $articles = Article::where('project_id', $projectId)
            ->whereNotNull('art')
            ->where('art', '!=', '')
            ->where('art', 'like', 'V%')
            ->paginate(10);

        return response()->json($articles);
    }

    public function store(Request $request, $projectId)
    {
        $project = Project::findOrFail($projectId);
        $data = $request->all();

        if (empty($data['art']) || !preg_match('/^V\d+$/', $data['art'])) {
            return response()->json([
                'message' => 'ignored',
                'reason'  => 'art must start with V followed by numbers'
            ], 200);
        }

        if (empty($data['ref'])) {
            return response()->json([
                'message' => 'ignored',
                'reason'  => 'ref is required'
            ], 200);
        }

        if (empty($data['des'])) {
            return response()->json([
                'message' => 'ignored',
                'reason'  => 'des is required'
            ], 200);
        }

        if (!empty($data['total']) && !is_numeric(str_replace(',', '.', $data['total']))) {
            return response()->json([
                'message' => 'ignored',
                'reason'  => 'total must be numeric'
            ], 200);
        }

        $article = $project->articles()->create($data);
        return response()->json($article, 201);
    }

    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);
        $article->update($request->all());
        return response()->json($article);
    }

    public function destroy($id)
    {
        Article::findOrFail($id)->delete();
        return response()->json(['message' => 'deleted']);
    }
}
