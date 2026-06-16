<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100|unique:classes,name',
            'description' => 'nullable|string|max:500',
            'academic_year' => 'required|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Nama kelas ini sudah digunakan, silakan pilih nama lain.',
        ];
    }
}
