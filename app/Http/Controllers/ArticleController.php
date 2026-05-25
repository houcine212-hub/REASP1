<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Project;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index($projectId)
    {
        $articles = Article::where('project_id', $projectId)->paginate(10);
        return response()->json($articles);
    }

    public function store(Request $request, $projectId)
    {
        $project = Project::findOrFail($projectId);
        $article = $project->articles()->create($request->all());
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
