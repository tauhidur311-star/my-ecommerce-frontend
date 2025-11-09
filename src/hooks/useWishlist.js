export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);
  
  const addToWishlist = (product) => {
    setWishlist(prev => [...prev, product]);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  };
  
  return { wishlist, addToWishlist };
}