import { useEffect, useState } from "react";

function AllListings() {
  // State to store the auction listings
  const [auctionListings, setAuctionListings] = useState([]);

  // Fetch data from the API when the component mounts
  useEffect(() => {
    fetch("https://api.noroff.dev/api/v1/auction/listings")
      .then((response) => response.json())
      .then((data) => setAuctionListings(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        {auctionListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white-100 p-4 rounded-md border-4"
          >
            <h1 className="text-2xl font-bold mb-2 text-black">
              {listing.title}
            </h1>
            <p className="text-gray-700 mb-4">{listing.description}</p>
            <p className="text-gray-600">
              Ends at: {new Date(listing.endsAt).toLocaleString()}
            </p>
            <p className="text-gray-600">Bids: {listing._count.bids}</p>
            <img className="mt-4" src={listing.media[0]} alt={listing.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllListings;
