<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/payment/return/success', fn () => response()->json([
    'status' => 'return_success',
    'message' => 'Retour paiement recu. Le statut final depend du callback serveur.',
]));

Route::get('/payment/return/failure', fn () => response()->json([
    'status' => 'return_failure',
    'message' => 'Retour paiement en echec recu. Le statut final depend du callback serveur.',
]));
