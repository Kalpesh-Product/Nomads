import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    searchKey: { type: String, required: true, index: true },
    isActive: {
      type: Boolean,
      default: false,
    },
    //hero
    companyLogo: {
      id: { type: String },
      url: { type: String },
    },

    companyName: { type: String, required: true },
    companyId: { type: String },
    workspaceId: { type: String },
    vertical: { type: String },
    title: { type: String, required: true },
    subTitle: { type: String, required: true },
    CTAButtonText: { type: String },
    pageNavItems: [
      {
        name: { type: String },
        slug: { type: String },
        enabled: { type: Boolean, default: true },
      },
    ],
    navItems: [
      {
        name: { type: String },
        slug: { type: String },
        enabled: { type: Boolean, default: true },
      },
    ],
    productDropdownPages: [
      {
        name: { type: String },
        slug: { type: String },
        enabled: { type: Boolean, default: true },
      },
    ],
    productPages: { type: mongoose.Schema.Types.Mixed },
    menuItems: { type: mongoose.Schema.Types.Mixed },
    rooms: { type: mongoose.Schema.Types.Mixed },
    meetingRooms: { type: mongoose.Schema.Types.Mixed },
    coLivingRooms: { type: mongoose.Schema.Types.Mixed },
    packages: { type: mongoose.Schema.Types.Mixed },
    dorms: { type: mongoose.Schema.Types.Mixed },
    heroImages: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],
    //about
    about: [{ type: String, required: true }],
    aboutPageIntro: { type: String },
    aboutPageStory: { type: String },
    aboutPageMission: { type: String },
    aboutPageVision: { type: String },
    aboutPageValues: { type: String },
    aboutPageTeamHeading: { type: String },
    aboutPageImageCards: { type: mongoose.Schema.Types.Mixed },
    //products
    productTitle: { type: String },
    productDropdownPages: { type: mongoose.Schema.Types.Mixed },
    products: [
      {
        type: { type: String, required: true },
        name: { type: String, required: true },
        cost: { type: String },
        description: { type: String, required: true },
        images: [
          {
            id: { type: String },
            url: { type: String },
          },
        ],
      },
    ],
    galleryTitle: { type: String },
    galleryPageHeading: { type: String },
    gallery: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],
    //   //testimonials
    testimonialTitle: { type: String },
    testimonialsPageHeading: { type: String },
    testimonialsPageIntro: { type: String },
    testimonials: [
      {
        image: {
          id: { type: String },
          url: { type: String },
        },
        name: { type: String },
        jobPosition: { type: String },
        testimony: { type: String },
        rating: { type: Number },
      },
    ],
    //contact
    contactTitle: { type: String },
    contactPageHeading: { type: String },
    contactPageIntro: { type: String },
    mapUrl: { type: String, required: true },
    email: { type: String, required: true },
    websiteEmail: { type: String },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    //footer
    registeredCompanyName: { type: String },
    copyrightText: { type: String, required: true },
  },
  { timestamps: true }
);

const WebsiteTemplate = mongoose.model("WebsiteTemplate", templateSchema);
export default WebsiteTemplate;
