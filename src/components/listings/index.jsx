import { useEffect, useState } from "react";

function AllListings() {
  // State to store the auction listings
  const [auctionListings, setAuctionListings] = useState([]);
  // State to store the filtered listings based on the search query
  const [filteredAuctionListings, setFilteredAuctionListings] = useState([]);
  // State to hold the search query
  const [searchQuery, setSearchQuery] = useState("");

  // State to trigger data refresh
  const [refreshData, setRefreshData] = useState(false);

  // Function to fetch data from the API
  const fetchData = () => {
    fetch("https://api.noroff.dev/api/v1/auction/listings")
      .then((response) => response.json())
      .then((data) => {
        // Sort the listings in descending order based on creation date
        const sortedListings = data.sort(
          (a, b) => new Date(b.created) - new Date(a.created)
        );
        setAuctionListings(sortedListings);
        setFilteredAuctionListings(sortedListings); // Initially set filtered listings to all listings
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  // Fetch data from the API when the component mounts or when refreshData changes
  useEffect(() => {
    const fetchDataAndResetRefresh = async () => {
      await fetchData();
      setRefreshData(false);
    };

    fetchDataAndResetRefresh();
  }, [refreshData]); // Include refreshData in the dependency array

  // Function to handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter listings based on the search query
    const filteredListings = auctionListings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query)
    );

    setFilteredAuctionListings(filteredListings);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search through listings..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="bg-white text-black p-2 mb-4 border rounded-md"
      />

      <div className="grid grid-cols-2 gap-4">
        {filteredAuctionListings.map((listing) => (
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
