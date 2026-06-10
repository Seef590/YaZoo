<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
            'objet' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ])->validate();

        Mail::raw(
            "De : {$validated['email']}\n\nObjet : " . ($validated['objet'] ?? 'Sans objet') . "\n\nMessage :\n{$validated['message']}",
            function ($mail) use ($validated): void {
                $mail->to('bough.youssef@gmail.com')
                    ->from(config('mail.from.address'), config('mail.from.name'))
                    ->replyTo($validated['email'])
                    ->subject('[YaZoo Contact] ' . ($validated['objet'] ?? 'Nouveau message'));
            },
        );

        return response()->json(['message' => 'Message envoye avec succes.']);
    }
}
