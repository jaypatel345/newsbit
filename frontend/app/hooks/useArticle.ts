
"use client";

import { useQuery } from "@tanstack/react-query";
import { getArticle } from "../services/article.service";


export function useArticle(id?: number) {

    return useQuery({

        queryKey: ["article", id],

        queryFn: () => getArticle(id!),

        enabled: !!id,

    });

}