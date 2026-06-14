<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JoinClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invite_code' => 'required|string|exists:classes,invite_code',
        ];
    }

    public function messages(): array
    {
        return [
            'invite_code.exists' => 'Kode invite kelas tidak valid. Cek lagi kode dari ketua kelas atau guru.',
        ];
    }
}
