import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Image } from "react-bootstrap";
import ArchTitle from "./ArchTitle";
import "./HomePage.css";

const HomePage = () => {
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const openPhotoLibrary = () => {
    libraryInputRef.current?.click();
  };

  const handleLibrarySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      navigate("/preview-photo", {
        state: {
          file: file,
          previewUrl: URL.createObjectURL(file),
        },
      });
    }
  };
  return (
    <Container className="text-center py-5">
      <ArchTitle text="Alina and Alex's Wedding" />

      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8} lg={6}>
          <div className="photoCollage">
            <img
              src="/src/assets/AA2.jpeg"
              alt="Photo 1"
              className="photo photo1"
            />
            <img
              src="/src/assets/Bean.jpeg"
              alt="Photo 2"
              className="photo photo2"
            />
            <img
              src="/src/assets/AA1.jpeg"
              alt="Photo 3"
              className="photo photo3"
            />
          </div>
        </Col>
      </Row>

      <input
        type="file"
        accept="image/*"
        ref={libraryInputRef}
        onChange={handleLibrarySelect}
        style={{ display: "none" }}
      />

      <Row className="justify-content-center">
        <Col xs={10} md={4} className="d-flex flex-column gap-3">
          <Button className="customBtn" onClick={openPhotoLibrary}>
            Capture Moment
          </Button>
          <Button
            className="customBtn"
            onClick={() => navigate("/photo-gallery")}
          >
            View Gallery
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
