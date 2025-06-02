import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { Row, Col, Button, Image, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./PhotoGallery.css";

interface Photo {
  id: string;
  url: string;
  name: string;
  createdAt: any;
}

const PhotoGallery = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photosData: Photo[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Photo, "id">),
      }));
      setPhotos(photosData);
    });

    return () => unsubscribe();
  }, []);

  const handleOpen = (url: string) => {
    setActiveImage(url);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setActiveImage(null);
  };

  const handleDownload = () => {
    if (!activeImage) return;
    const link = document.createElement("a");
    link.href = activeImage;
    link.download = "wedding-photo.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <Button
        variant="secondary"
        onClick={() => navigate("/")}
        style={{ marginBottom: "1rem" }}
      >
        &larr; Back
      </Button>

      <Row xs={2} sm={2} md={3} lg={4} className="g-3">
        {photos.map((photo) => (
          <Col key={photo.id}>
            <Image
              src={photo.url}
              alt="Gallery photo"
              className="galleryImage"
              onClick={() => handleOpen(photo.url)}
              fluid
            />
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Body className="p-0">
          {activeImage && (
            <Image
              src={activeImage}
              alt="Full view"
              fluid
              style={{ width: "100%", height: "auto" }}
            />
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            style={{ backgroundColor: "#9CAF88", border: "none" }}
            onClick={handleDownload}
          >
            Save Photo
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PhotoGallery;
