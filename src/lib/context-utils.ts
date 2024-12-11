export function extractPageData(element: HTMLElement | null): any {
  if (!element) return null;
  
  try {
    // Try to get data from data-page-details attribute
    const pageDetails = element.getAttribute('data-page-details');
    if (pageDetails) {
      return JSON.parse(pageDetails);
    }
    
    // Fall back to collecting data from specific data attributes
    const dataAttributes = Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('data-'))
      .reduce((acc, attr) => ({
        ...acc,
        [attr.name.replace('data-', '')]: attr.value
      }), {});
      
    return Object.keys(dataAttributes).length > 0 ? dataAttributes : null;
  } catch (e) {
    console.error('Error extracting page data:', e);
    return null;
  }
} 