<?php

namespace App\Http\Requests\ServiceListing;

class UpdateServiceListingRequest extends StoreServiceListingRequest
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
