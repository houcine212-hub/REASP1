<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function csv($id)
    {
        $project = Project::with('articles')->findOrFail($id);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $project->name . '.csv"',
        ];

        $callback = function () use ($project) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['ART', 'REF', 'DES', 'TOTAL', 'UNIT', 'EMP_M', 'EMP_CM', 'EMP_MAX', 'ADDR_R', 'ADDR_C', 'PALET', 'QTE_PALET', 'CART', 'QTE_CART', 'SAG', 'QTE_SAG']);

            foreach ($project->articles as $a) {
                fputcsv($file, [
                    $a->art, $a->ref, $a->des, $a->total, $a->unit,
                    $a->emp_m, $a->emp_cm, $a->emp_max,
                    $a->addr_r, $a->addr_c,
                    $a->palet, $a->qte_palet,
                    $a->cart, $a->qte_cart,
                    $a->sag, $a->qte_sag,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
