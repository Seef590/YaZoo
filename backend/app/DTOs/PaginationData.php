<?php

namespace App\DTOs;

use Illuminate\Http\Request;

final readonly class PaginationData
{
    public function __construct(
        public int $perPage,
    ) {}

    public static function fromRequest(Request $request, int $default = 20, int $max = 50): self
    {
        $requested = (int) $request->integer('per_page', $default);

        return new self(max(1, min($requested, $max)));
    }
}
