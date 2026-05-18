"use client";

import { useEffect, useState } from "react";
import { FoodCard } from "@/components/food/FoodCard";
import { getFoods } from "@/services/api";
import type { Food } from "@/utils/types";

export function FeaturedCarousel() {
  const [foods, setFoods] = useState<Food[]>([]);

  useEffect(() => {
    getFoods({ featured: true }).then(setFoods);
  }, []);

  return (
    <div className="hide-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
      {foods.map((food) => (
        <div key={food._id} className="w-[82vw] max-w-sm shrink-0 snap-start sm:w-80">
          <FoodCard food={food} compact />
        </div>
      ))}
    </div>
  );
}
