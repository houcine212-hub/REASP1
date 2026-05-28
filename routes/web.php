<?php
use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
Route::get('/clean/{projectId}', function ($projectId) {
    $deleted = \App\Models\Article::where('project_id', $projectId)
        ->where(function ($q) {
            $q->whereNull('art')
              ->orWhere('art', '')
              ->orWhereRaw("art NOT REGEXP '^V[0-9]+$'");
        })
        ->delete();
    return "Deleted $deleted invalid articles";
});
