<?php

namespace App\Http\Requests\Marketplace;

class UpdateVeterinarianRequest extends StoreVeterinarianRequest
{
    public function rules(): array
    {
        return collect(parent::rules())
            ->map(function (array|string $rules): array {
                $rules = is_array($rules) ? $rules : [$rules];

                return array_values(array_filter($rules, fn ($rule) => $rule !== 'required'));
            })
            ->all();
    }
}
