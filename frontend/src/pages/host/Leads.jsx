import React from "react";
import Container from "../../components/Container";
import LeadsImage from "/hosts/leads-section-image-webp.webp";
import GoogleSheetsImage from "/hosts/google-sheets-image-webp.webp";

const Leads = () => {
  return (
    <div>
      {/* Dummy Header (To Be Removed Later) */}
      <div className="h-20 w-full bg-black"></div>
      {/* Top Text section */}
      <Container>
        <div>
          <div>
            <p>
              Generate continuos structured leads for your business with the
              support of our automated platform and trained and experienced
              resources.
            </p>
          </div>
          <div>
            <button className="bg-black text-white">Get Started</button>
          </div>
        </div>
      </Container>

      {/* Social media icons banner */}
      <div>
        <img src={LeadsImage} alt="Leads Image" className="w-full" />
      </div>

      {/* Our Core focus section */}
      <Container>
        <div>
          <div>
            <p>Our core focus is to generate ORGANIC LEADS!</p>
            <p>With NO INVESTMENTS!</p>
          </div>
          <div className="flex flex-row justify-center items-center gap-4">
            <div>Checklist</div>
            <div>Company logos section</div>
          </div>
        </div>
      </Container>

      {/* Automated Google Leads Section */}
      <Container>
        <div>
          <div>
            <p>Automated Google LEAD SHEET!</p>
            <p>Never miss any leads generated from our platform.</p>
          </div>
          <div className="h-[16rem]">
            <img
              src={GoogleSheetsImage}
              alt="Google Sheets"
              className="w-full object-cover h-full"
            />
          </div>
        </div>
      </Container>

      {/* Run & Scale Grid Section */}
      <div>
        <div>RUN & SCALE YOUR BUSINESS</div>
        <div>Marketing</div>
        <hr />
        <div>Grid With Sections</div>
        <div>
          <button className="bg-black text-white">Get Started</button>
        </div>
      </div>

      <hr />

      {/* Get better ROI Section */}
      <div className="flex flex-row justify-center items-center gap-4">
        <div>Image</div>
        <div>
          <div>Header</div>

          <div>Content</div>
        </div>
      </div>

      <hr />

      {/* Get a Complete View Section */}
      <div className="flex flex-row justify-center items-center gap-4">
        <div>
          <div>Header</div>

          <div>Content</div>
        </div>
        <div>Image</div>
      </div>

      <hr />

      {/* The finer points Section */}
      <div className="flex flex-row justify-center items-center gap-4">
        <div>Image</div>
        <div>
          <div>Header</div>

          <div>Content</div>
        </div>
      </div>

      {/* Dummy Footer (To Be Removed Later) */}
      <div className="h-80 w-full bg-black"></div>
    </div>
  );
};

export default Leads;
