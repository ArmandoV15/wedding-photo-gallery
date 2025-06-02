import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Image, Spinner } from "react-bootstrap";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface LocationState {
  file: File;
  previewUrl: string;
}

const SageSpinner = () => (
  <Spinner
    animation="border"
    role="status"
    style={{ color: "#9caf88" /* sage color */ }}
  >
    <span className="visually-hidden">Uploading...</span>
  </Spinner>
);

const PreviewPhoto = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;
  const [loading, setLoading] = useState(false);

  const imageUrl = (location.state as { imageUrl?: string })?.imageUrl;

  if (!state || !state.file || !state.previewUrl) {
    return <p>No photo to preview.</p>;
  }

  const uploadPhoto = async () => {
    setLoading(true);
    if (!state.file) return;

    try {
      // Create a unique file path
      const storageRef = ref(
        storage,
        `wedding-photos/${Date.now()}_${state.file.name}`
      );

      // Upload file
      await uploadBytes(storageRef, state.file);

      // Get URL
      const url = await getDownloadURL(storageRef);

      // Save metadata in Firestore
      await addDoc(collection(db, "photos"), {
        url,
        name: state.file.name,
        createdAt: serverTimestamp(),
      });

      alert("Photo uploaded successfully!");
      navigate("/");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="text-center mt-5">
      <h2>Moment Preview</h2>
      <Image
        src={state.previewUrl}
        fluid
        rounded
        className="shadow my-4"
        style={{ maxHeight: "80vh" }}
      />
      <div>
        {loading ? (
          <SageSpinner />
        ) : (
          <Button
            className="customBtn"
            onClick={uploadPhoto}
            disabled={loading}
          >
            Upload
          </Button>
        )}
      </div>
    </Container>
  );
};

export default PreviewPhoto;
