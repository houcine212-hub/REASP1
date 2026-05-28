<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'message' => 'required|string',
        ]);

        Mail::raw(
            "Name: {$request->name}\nEmail: {$request->email}\n\n{$request->message}",
            function ($msg) use ($request) {
                $msg->to('onepiece9m12@gmail.com')
                    ->subject('Message from ' . $request->name . ' - RESP1');
            }
        );

        return response()->json(['message' => 'sent'], 200);
    }
}
