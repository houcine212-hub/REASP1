<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::latest()->paginate(10);
        return response()->json($projects);
    }

    public function dashboard()
    {
        $projects = Project::latest()->take(10)->get();
        $total = Project::count();
        return response()->json(['projects' => $projects, 'total' => $total]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'type' => 'nullable|string',
        ]);

        $project = Project::create([
            'name' => $request->name,
            'type' => $request->type ?? 'General',
        ]);

        return response()->json($project, 201);
    }

    public function show($id)
    {
        $project = Project::with('articles')->findOrFail($id);
        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        $project->update($request->only(['name', 'type', 'status']));
        return response()->json($project);
    }

    public function destroy($id)
    {
        Project::findOrFail($id)->delete();
        return response()->json(['message' => 'deleted']);
    }
}
