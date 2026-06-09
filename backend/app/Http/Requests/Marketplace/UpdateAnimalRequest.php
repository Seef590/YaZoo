<?php

namespace App\Http\Requests\Marketplace;

use App\Models\Animal;

class UpdateAnimalRequest extends StoreAnimalRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var Animal|null $animal */
        $animal = $this->route('animal');

        return $animal !== null && ($this->user()?->can('update', $animal) ?? false);
    }
}
