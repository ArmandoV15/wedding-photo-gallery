import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Image,
  Spinner,
  Ratio,
  Row,
  Col,
} from "react-bootstrap";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import "./PreviewPhoto.css";

interface MediaItem {
  file: File;
  previewUrl: string;
  fileType: string;
}

interface LocationState {
  media: MediaItem[];
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
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(
    (location.state as LocationState | undefined)?.media || []
  );
  const [loading, setLoading] = useState(false);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  if (mediaItems.length === 0) {
    navigate("/");
  }
  const generateThumbnail = (index: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = videoRefs.current[index];
      if (!video) return reject("Video ref not found");

      const canvas = document.createElement("canvas");
      video.currentTime = 1;

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas context error");

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) =>
            blob ? resolve(blob) : reject("Failed to create thumbnail blob"),
          "image/jpeg",
          0.75
        );
      };

      if (video.readyState >= 2) {
        video.currentTime = 1;
      } else {
        video.onloadedmetadata = () => {
          video.currentTime = 1;
        };
      }
    });
  };

  const uploadMedia = async () => {
    setLoading(true);

    try {
      for (let i = 0; i < mediaItems.length; i++) {
        const { file, fileType } = mediaItems[i];
        let thumbnailUrl = "";

        if (fileType === "video") {
          const thumbBlob = await generateThumbnail(i);
          const thumbRef = ref(
            storage,
            `wedding-media/thumbnails/${Date.now()}_${file.name}.jpg`
          );
          await uploadBytes(thumbRef, thumbBlob);
          thumbnailUrl = await getDownloadURL(thumbRef);
        }

        const fileRef = ref(
          storage,
          `wedding-media/${Date.now()}_${file.name}`
        );
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        await addDoc(collection(db, "wedding-media-urls"), {
          url,
          name: file.name,
          fileType,
          thumbnailUrl: thumbnailUrl || null,
          createdAt: serverTimestamp(),
        });
      }

      alert("All media uploaded successfully!");
      navigate("/");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="stickyButtonWrapper">
        <Button
          variant="secondary"
          className="shadow-sm"
          onClick={() => navigate("/")}
        >
          ← Back
        </Button>

        {!loading ? (
          <Button
            variant="success"
            onClick={uploadMedia}
            className="shadow customBtn"
          >
            Upload All
          </Button>
        ) : (
          <SageSpinner />
        )}
      </div>
      <Container className="text-center mt-2">
        <h2>Moments Preview</h2>
        <Row className="my-4">
          {mediaItems.map((item, index) => (
            <Col xs={6} md={6} key={index} className="mb-4 position-relative">
              {item.fileType === "video" ? (
                <>
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={item.previewUrl}
                    style={{ display: "none" }}
                    preload="metadata"
                  />
                  <Ratio aspectRatio="16x9">
                    <video
                      src={item.previewUrl}
                      controls
                      className="w-100 h-100 rounded shadow"
                    />
                  </Ratio>
                </>
              ) : (
                <Image
                  src={item.previewUrl}
                  fluid
                  rounded
                  className="shadow"
                  style={{ maxHeight: "60vh" }}
                />
              )}
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default PreviewPhoto;
