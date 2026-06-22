-- Total Revenue
WITH target_date AS (
    SELECT 
        '2026-06-01'::DATE AS current_start,
        ('2026-06-01'::DATE + '1 month'::INTERVAL  - INTERVAL '1 day')::DATE AS current_end,
        ('2026-06-01'::DATE - '1 month'::INTERVAL)::DATE AS prev_start
),
revenue_data AS (
    SELECT 
        TO_CHAR(so.date_order, 'YYYY-MM') AS period,
        SUM(so.amount_total) AS revenue
    FROM sale_order so
    WHERE so.state IN ('sale', 'done') 
        AND so.date_order >= (SELECT prev_start FROM target_date)
        AND so.date_order <= (SELECT current_end FROM target_date)
        AND user_id != 152
    GROUP BY 1
),
comparison_trend AS (
    SELECT
        TO_CHAR(series, 'YYYY-MM') AS period,
        COALESCE(r.revenue, 0) AS revenue,
        LAG(COALESCE(r.revenue, 0), 1) OVER (ORDER BY series) AS prev_revenue
    FROM target_date td
    CROSS JOIN LATERAL generate_series(td.prev_start::timestamp, td.current_end::timestamp, '1 month') series
    LEFT JOIN revenue_data r ON TO_CHAR(series, 'YYYY-MM') = r.period
)
SELECT 
    revenue, 
    CASE
        WHEN prev_revenue IS NULL OR prev_revenue = 0 THEN 0
        ELSE ROUND(((revenue - prev_revenue) * 100 / prev_revenue), 1)
    END AS percentage_grow
FROM comparison_trend
ORDER BY period DESC
LIMIT 1


-- Total Expected
WITH target_date AS (
    SELECT 
        '2026-06-01'::DATE AS current_start,
        ('2026-06-01'::DATE + '1 month'::INTERVAL  - INTERVAL '1 day')::DATE AS current_end,
)
SELECT SUM(expected_revenue) 
FROM crm_lead
WHERE lead_aging <= 90 
    AND user_id != 152 
    AND stage_id NOT IN (8,9,12)
    AND create_date >= (SELECT prev_start FROM target_date)
    AND create_date <= (SELECT prev_start FROM current_end)