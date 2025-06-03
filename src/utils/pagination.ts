export const getPagination = (page: number, limit: number, total: number) => {
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    
    return {
      page,
      limit,
      skip,
      pages,
      total
    };
  };
  
  export const getPaginationLinks = (
    req: any,
    page: number,
    pages: number,
    limit: number
  ) => {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const query = { ...req.query };
    
    const links = {
      first: `${baseUrl}?${new URLSearchParams({ ...query, page: '1', limit: limit.toString() }).toString()}`,
      last: `${baseUrl}?${new URLSearchParams({ ...query, page: pages.toString(), limit: limit.toString() }).toString()}`,
      prev: page > 1 
        ? `${baseUrl}?${new URLSearchParams({ ...query, page: (page - 1).toString(), limit: limit.toString() }).toString()}`
        : null,
      next: page < pages
        ? `${baseUrl}?${new URLSearchParams({ ...query, page: (page + 1).toString(), limit: limit.toString() }).toString()}`
        : null
    };
  
    return links;
  };