<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Party extends Model
{
    protected $fillable = ['idjoueur', 'score', 'category'];

    protected $casts = [
        'idjoueur' => 'integer',
        'score' => 'integer',
        'category' => 'string',
    ];
}
