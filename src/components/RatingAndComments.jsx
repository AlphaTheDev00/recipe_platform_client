import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { getApiUrl } from "../utils/api"; // Import the API utility

const RatingAndComments = ({ recipeId }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCommentsAndRating();
  }, [recipeId, user]);

  const fetchCommentsAndRating = async () => {
    try {
      // Fetch comments using the recipe_comments endpoint
      const commentsResponse = await axios.get(
        getApiUrl("api/comments/recipe_comments/"),
        {
          params: { recipe_id: recipeId },
        }
      );
      setComments(commentsResponse.data);

      // Only fetch ratings if user is logged in
      if (user) {
        try {
          const ratingsResponse = await axios.get(
            getApiUrl("api/ratings/user_rating/"),
            {
              params: { recipe_id: recipeId },
            }
          );

          // If we get a successful response, set the rating
          setUserRating(ratingsResponse.data);
          setRating(ratingsResponse.data.score);
        } catch (ratingErr) {
          // If 404, it means the user hasn't rated yet - this is normal
          if (ratingErr.response && ratingErr.response.status !== 404) {
            console.error("Error fetching user rating:", ratingErr);
          }
          // Don't set error for ratings - just log it
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error in fetchCommentsAndRating:", err);
      setError("Error fetching comments and ratings");
      setLoading(false);
    }
  };

  const handleRatingChange = async (newRating) => {
    if (!user) {
      setError("Please login to rate recipes");
      return;
    }

    try {
      if (userRating) {
        await axios.put(getApiUrl(`api/ratings/${userRating.id}/`), {
          recipe: recipeId,
          score: newRating,
        });
      } else {
        await axios.post(getApiUrl("api/ratings/"), {
          recipe: recipeId,
          score: newRating,
        });
      }
      setRating(newRating);
      fetchCommentsAndRating();
    } catch (err) {
      setError("Error saving rating");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please login to comment");
      return;
    }

    try {
      await axios.post(getApiUrl("api/comments/"), {
        recipe: recipeId,
        content: comment,
      });
      setComment("");
      fetchCommentsAndRating();
    } catch (err) {
      setError("Error posting comment");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="mt-4">
      {/* Rating Section */}
      <div className="mb-4">
        <h4>Rate this Recipe</h4>
        <div className="d-flex align-items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`btn btn-link p-0 ${
                star <= rating ? "text-warning" : "text-muted"
              }`}
              onClick={() => handleRatingChange(star)}
              disabled={!user}
            >
              <i className="bi bi-star-fill fs-4"></i>
            </button>
          ))}
          {!user && (
            <small className="text-muted ms-2">Login to rate this recipe</small>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div>
        <h4>Comments</h4>

        {/* Comment Form */}
        {user && (
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <div className="d-flex mb-3">
              <div
                className="comment-avatar me-3 flex-shrink-0"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: "#333",
                  backgroundImage: user?.profile_picture_url
                    ? `url(${user.profile_picture_url})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  overflow: "hidden",
                  marginTop: "5px",
                }}
              >
                {!user?.profile_picture_url &&
                  user?.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow-1">
                <textarea
                  className="form-control"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="3"
                  required
                />
                <div className="mt-2 text-end">
                  <button type="submit" className="btn btn-primary">
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="text-muted">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex align-items-start mb-3">
                    <div
                      className="comment-avatar me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        color: "#333",
                        backgroundImage: comment.profile_picture_url
                          ? `url(${comment.profile_picture_url})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        overflow: "hidden",
                      }}
                    >
                      {!comment.profile_picture_url &&
                        comment.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="card-subtitle mb-1">
                        {comment.user.username}
                      </h6>
                      <small className="text-muted">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <p className="card-text">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingAndComments;
