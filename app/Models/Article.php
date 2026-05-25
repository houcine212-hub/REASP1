<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'project_id', 'art', 'ref', 'des', 'total', 'unit',
        'emp_m', 'emp_cm', 'emp_max', 'addr_r', 'addr_c',
        'palet', 'qte_palet', 'cart', 'qte_cart', 'sag', 'qte_sag'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
