
-- Function to get monthly revenue data for a given year
CREATE OR REPLACE FUNCTION public.get_monthly_revenue(year_param integer DEFAULT EXTRACT(year FROM CURRENT_DATE))
RETURNS TABLE(month integer, total numeric) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    EXTRACT(MONTH FROM payment_date)::integer as month,
    COALESCE(SUM(amount), 0) as total
  FROM 
    payments
  WHERE 
    EXTRACT(YEAR FROM payment_date) = year_param
  GROUP BY 
    month
  ORDER BY 
    month;
END;
$$;
