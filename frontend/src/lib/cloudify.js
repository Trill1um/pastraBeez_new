export default function cloudinaryImage(url, type, isPreview) {
  if (!url) {
    return null; // or return a placeholder image URL
  }
  if (!isPreview) {
    const parts = url.split("/upload/");
    if (parts.length !== 2) {
      throw new Error("Invalid Cloudinary URL: missing /upload/");
    }

    let transformation = "";
    switch (type) {
      case "grid":
        // Smaller size for product cards
        transformation = "w_400,h_400,c_fill,f_auto,q_auto";
        break;
      case "detail":
        // Larger image for product detail page
        transformation = "w_1200,f_auto,q_auto";
        break;
      case "thumbnail":
        transformation = "w_150,h_150,c_fill,f_auto,q_auto";
        break;
      default:
        throw new Error(`Unknown type: ${type}`);
    }

    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  }
  return url.url;
}
