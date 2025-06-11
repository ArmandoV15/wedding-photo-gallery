import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Image, Spinner, Ratio } from "react-bootstrap";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface LocationState {
  file: File;
  previewUrl: string;
  fileType: string;
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
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!state || !state.file || !state.previewUrl) {
    return <p>No photo to preview.</p>;
  }

  const generateThumbnail = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) return reject("Video ref not set");

      const video = videoRef.current;
      const canvas = document.createElement("canvas");

      video.currentTime = 1; // seek to 1 second to capture frame

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas context error");

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject("Failed to create thumbnail blob");
          },
          "image/jpeg",
          0.75
        );
      };

      // In case video metadata is not loaded yet
      if (video.readyState >= 2) {
        // metadata loaded, trigger onseeked manually
        video.currentTime = 1;
      } else {
        video.onloadedmetadata = () => {
          video.currentTime = 1;
        };
      }
    });
  };

  const uploadPhoto = async () => {
    setLoading(true);
    if (!state.file) return;

    try {
      let thumbnailUrl = "";

      if (state.fileType === "video") {
        // Generate thumbnail
        const thumbBlob = await generateThumbnail();

        // Upload thumbnail first
        const thumbRef = ref(
          storage,
          `wedding-media/thumbnails/${Date.now()}_${state.file.name}.jpg`
        );
        await uploadBytes(thumbRef, thumbBlob);
        thumbnailUrl = await getDownloadURL(thumbRef);
      }

      // Create a unique file path
      const storageRef = ref(
        storage,
        `wedding-media/${Date.now()}_${state.file.name}`
      );

      // Upload file
      await uploadBytes(storageRef, state.file);

      // Get URL
      const url = await getDownloadURL(storageRef);

      // Save metadata in Firestore
      await addDoc(collection(db, "wedding-media-urls"), {
        url,
        name: state.file.name,
        fileType: state.fileType,
        thumbnailUrl: thumbnailUrl || null,
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
      {state.fileType === "video" ? (
        <>
        {/* Hidden video used to generate thumbnail */}
        <video
          ref={videoRef}
          src={state.previewUrl}
          style={{ display: "none" }}
          preload="metadata"
        />
        <Ratio aspectRatio="16x9" className="mb-4">
          <video
            src={state.previewUrl}
            controls
            className="w-100 h-100 rounded shadow"
          />
        </Ratio>
      </>
      ) : (
        <Image
          src={state.previewUrl}
          fluid
          rounded
          className="shadow my-4"
          style={{ maxHeight: "80vh" }}
        />
      )}

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
