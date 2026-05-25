<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('art')->nullable();
            $table->string('ref')->nullable();
            $table->string('des')->nullable();
            $table->string('total')->nullable();
            $table->string('unit')->nullable();
            $table->string('emp_m')->nullable();
            $table->string('emp_cm')->nullable();
            $table->string('emp_max')->nullable();
            $table->string('addr_r')->nullable();
            $table->string('addr_c')->nullable();
            $table->string('palet')->nullable();
            $table->string('qte_palet')->nullable();
            $table->string('cart')->nullable();
            $table->string('qte_cart')->nullable();
            $table->string('sag')->nullable();
            $table->string('qte_sag')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
