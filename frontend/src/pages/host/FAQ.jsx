import React from "react";
import blueUnderline from "../../assets/blue_underline.png";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "What is SaaS?",
    a: "SaaS stands for Software as a Service. It is a software delivery model where applications are hosted in the cloud and accessed via the internet, typically on a subscription basis."
  },
  {
    q: "What is N-Commerce?",
    a: "N-Commerce = Nomad Commerce. We are pioneering the concept of providing our proprietary SaaS for businesses that are providing solutions and services to Nomads across big, small and aspiring destinations..."
  },
  {
    q: "How is SaaS different from traditional software?",
    a: "SaaS is cloud-based and does not require users to install software on their local devices. Traditional software often requires installation and may demand upfront payment, while SaaS usually follows a subscription model."
  },
  {
    q: "Is WoNo SaaS really for FREE?",
    a: "Yes, at this stage we intend to support businesses who are struggling for such tech and grow their business and organise these business initially. It’s totally FREE for now."
  },
  {
    q: "How secure is my data?",
    a: "SaaS providers typically use encryption, data redundancy, and regular security audits to protect user data."
  },
  {
    q: "Can I customize the software?",
    a: "Our SaaS solutions are instant ready solutions to start your initial tech stack. We are open to offer customizable and integrations with other applications..."
  },
  {
    q: "What happens if I cancel my subscription?",
    a: "Upon cancellation, access to the software and any associated services shall stop. We shall retain your data for 30 days post cancellation..."
  },
  {
    q: "How often is the software updated?",
    a: "We intend and shall be regularly updating our software, with patches and new features automatically rolled out..."
  },
  {
    q: "Do you offer customer support?",
    a: "We offer various support options, including chat, email, phone support, and knowledge bases. We shall be offering premium instant support soon."
  },
  {
    q: "Is the software mobile-friendly?",
    a: "Our SaaS platform offers responsive web designs (mobile apps coming soon), allowing users to access the software on smartphones or tablets."
  },
  {
    q: "What is uptime and how reliable is your service?",
    a: "Our company offers guaranteed uptime in a Service Level Agreement (SLA). Typical guarantees are 99.9% uptime."
  },
  {
    q: "Can I integrate with other tools?",
    a: "Our SaaS platform currently supports our proprietary tech and we shall soon be activating integrations with popular tools..."
  },
  {
    q: "How do you handle backups and data recovery?",
    a: "We usually perform regular backups and have disaster recovery plans in place. We also offer data recovery options."
  },
  {
    q: "Is there a limit on the number of users?",
    a: "As of now there are no user limitations on our platform."
  },
  {
    q: "Do you support CRM functionality?",
    a: "Yes, our platform includes a built-in Customer Relationship Management (CRM) system..."
  },
  {
    q: "Can I manage multiple properties or agents from one account?",
    a: "Yes, our software allows you to manage multiple properties, agents, and offices from a single account..."
  },
  {
    q: "What types of reports can I generate?",
    a: "You can generate various reports, including property performance, sales activity, lead tracking..."
  },
  {
    q: "Do you offer training and support?",
    a: "Yes, we offer onboarding and training sessions to help you get the most out of the platform..."
  },
  {
    q: "Can I ask the support team any questions or request customised requirements?",
    a: "Yes, we are more than open to answer any of your questions and try our best to provide customised solutions."
  },
  {
    q: "Where can I contact you?",
    a: <>Write to us at <a className="WONOBLUE text-decoration-none" href="mailto:response@wono.co">response@wono.co</a> and we shall try and get back to you asap.</>
  },
  {
    q: "Are there any hidden charges?",
    a: "No, our SaaS is absolutely free for now."
  },
  {
    q: "In which countries does WoNo provide its SaaS & Support?",
    a: "We offer our SaaS and Support across the world."
  },
  {
    q: "Can I apply to work or contribute at WoNo?",
    a: <>Yes, we welcome contributors and applicants. Reach us at <a className="WONOBLUE text-decoration-none" href="mailto:hr@wono.co">hr@wono.co</a> or apply from our careers page.</>
  },
  {
    q: "Can I connect with the Founders of the company?",
    a: "Yes, the founders are open to virtual meetings with well-wishers after an initial support team call."
  }
];

const HostFAQ = () => {
  return (
    <div className="flex flex-col gap-10 px-28 py-4 text-[#364D59]">
       <div className="flex flex-col items-center relative font-comic uppercase font-bold text-secondary-dark text-[clamp(1.5rem,4vw,3rem)] leading-tight">
      <h3>
        Frequently Asked Questions (FAQ)
        </h3>
        <img
          src={blueUnderline}
          alt=""
          className="absolute top-[100%] left-[11.5%] w-[76%] h-[40%]"
        />
      </div>

      <div>
        {faqs.map((item, i) => (
          <div key={i}>
            <div className="flex flex-col gap-4 my-4 font-sans">
              <h4 className="font-sans text-subtitle font-semibold">
                {i + 1}. {item.q}
              </h4>
              <p className="text-content">{item.a}</p>
            </div>
            {i < faqs.length - 1 && <hr className="border-gray-300" />}
          </div>
        ))}

        <p className="mt-16 mb-8">
          Can’t find the answer to your question? Connect with us via our{" "}
          <Link className="text-primary-blue text-decoration-none" to="/contact">
            Contact us
          </Link>{" "}
          page.
        </p>
      </div>
    </div>
  );
};


export default HostFAQ;
