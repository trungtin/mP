SELECT m.*, bool_or(mu.is_work) AS any_link_work FROM public.movies m
LEFT JOIN public.movie_urls mu
ON m.tmdb_id = mu.movie_id
GROUP BY m.id HAVING (bool_or(mu.is_work) = 'false' OR bool_or(mu.is_work) IS NULL)
ORDER BY m.t_popularity DESC
LIMIT 10