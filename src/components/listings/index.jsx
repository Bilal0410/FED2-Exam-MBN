import { useEffect, useState } from "react";

function AllListings() {
  const [auctionListings, setAuctionListings] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [bidAmounts, setBidAmounts] = useState({});
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchDataAndResetRefresh = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");

        const response = await fetch(
          "https://api.noroff.dev/api/v1/auction/listings?sort=created&sortOrder=desc",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const sortedListings = data.sort(
            (a, b) => new Date(b.created) - new Date(a.created)
          );
          setAuctionListings(sortedListings);
        } else {
          console.error("Error fetching data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setRefreshData(false);
    };

    fetchDataAndResetRefresh();
  }, [refreshData]);

  const handleBidSubmit = async (listingId) => {
    try {
      const response = await fetch(
        `https://api.noroff.dev/api/v1/auction/listings/${listingId}/bids`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            amount: Number(bidAmounts[listingId]) || 0,
          }),
        }
      );

      if (response.ok) {
        console.log("Bid placed successfully!");

        const currentUserCredits = JSON.parse(
          localStorage.getItem("user_credits") || "0"
        );

        const updatedUserCredits =
          currentUserCredits - (Number(bidAmounts[listingId]) || 0);
        localStorage.setItem(
          "user_credits",
          JSON.stringify(updatedUserCredits)
        );

        setSuccessMessage("Bid placed successfully!");
        setErrorMessage("");
        setRefreshData(true);
      } else {
        const errorData = await response.json();
        console.error("Error submitting bid:", response.status, errorData);
        setErrorMessage("Error submitting bid. Please try again.");
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
      setErrorMessage("Error submitting bid. Please try again.");
      setSuccessMessage("");
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filterListings = (listings) => {
    return listings.filter(
      (listing) =>
        (listing.title &&
          listing.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (listing.description &&
          listing.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div>
        <label>
          <input
            type="text"
            placeholder="Search through listings..."
            value={searchQuery}
            onChange={handleSearch}
            className="bg-white text-black ml-2 border rounded-md p-1"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filterListings(auctionListings).map((listing) => (
          <div
            key={listing.id}
            className="bg-white-100 p-4 rounded-md border-4 border-black overflow-hidden"
          >
            <h1 className="text-2xl font-bold mb-2 text-black overflow-hidden">
              {listing.title}
            </h1>
            <p className="text-gray-700 mb-4 overflow-hidden">
              {listing.description}
            </p>
            <p className="text-gray-600">
              Ends at: {new Date(listing.endsAt).toLocaleString()}
            </p>
            <p className="text-gray-600">Bids: {listing._count.bids}</p>
            <img className="mt-4" src={listing.media[0]} alt={listing.title} />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSelectedListingId(listing.id);
                handleBidSubmit(listing.id);
              }}
            >
              <label className="text-black">
                Bid Amount:
                <input
                  type="number"
                  value={bidAmounts[listing.id] || 0}
                  onChange={(e) =>
                    setBidAmounts((prevBidAmounts) => ({
                      ...prevBidAmounts,
                      [listing.id]: e.target.value,
                    }))
                  }
                  required
                  className="bg-white text-black ml-2 border rounded-md p-1"
                />
              </label>
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-md ml-2"
              >
                Place Bid
              </button>
            </form>

            {selectedListingId === listing.id && successMessage && (
              <p className="text-green-500 mt-2">{successMessage}</p>
            )}

            {selectedListingId === listing.id && errorMessage && (
              <p className="text-red-500 mt-2">{errorMessage}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllListings;
