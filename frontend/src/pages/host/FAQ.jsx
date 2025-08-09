import React from "react";
import blueUnderline from "../../assets/blue_underline.png";
import { Link } from "react-router-dom";

const HostFAQ = () => {
  return (
    <div className="flex flex-col gap-10 px-28 py-4 text-[#364D59]">
      <h3 className="relative inline-block text-center font-comic uppercase font-bold text-secondary-dark text-[clamp(1.5rem,4vw,3rem)] leading-tight">
        Frequently Asked Questions (FAQ)
        <img
          src={blueUnderline}
          alt=""
          className="absolute top-[100%] left-[11.5%] w-[76%] h-[40%]"
        />
      </h3>

      <div>
        <div className="flex flex-col my-4 font-sans gap-4">
          <h4 className="font-sans text-subtitle font-semibold">
            1. What is SaaS?
          </h4>
          <p className="text-content">
            SaaS stands for Software as a Service. It is a software delivery
            model where applications are hosted in the cloud and accessed via
            the internet, typically on a subscription basis.
          </p>
        </div>

        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            2. What is N-Commerce?
          </h4>
          <p className="text-content">
            N-Commerce = Nomad Commerce. We are pioneering the concept of
            providing our proprietary SaaS for businesses that are providing
            solutions and services to Nomads across big, small and aspiring
            destinations. These could be any businesses such as co-working,
            co-living, hostels, events, resorts, cafes which are managed by
            companies or professionals who do not have tech to support their
            growth and who especially do not have the budget to build such tech.
          </p>
        </div>
        <hr className="border-gray-300" />
        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            4. How is SaaS different from traditional software?
          </h4>
          <p className="text-content">
            SaaS is cloud-based and does not require users to install software
            on their local devices. Traditional software often requires
            installation and may demand upfront payment, while SaaS usually
            follows a subscription model.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            5. Is WoNo SaaS really for FREE?
          </h4>
          <p className="text-content">
            Yes, at this stage we intend to support businesses who are
            struggling for such tech and grow their business and organise these
            business initially. It’s totally FREE for now.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            6. How secure is my data?
          </h4>
          <p className="text-content">
            SaaS providers typically use encryption, data redundancy, and
            regular security audits to protect user data.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            7. Can I customize the software?
          </h4>
          <p className="text-content">
            Our SaaS solutions are instant ready solutions to start your initial
            tech stack. We are open to offer customizable and integrations with
            other applications. We are more than open to suggestions and
            feedback for further customization.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            8. What happens if I cancel my subscription?
          </h4>
          <p className="text-content">
            Upon cancellation, access to the software and any associated
            services shall stop. We shall retain your data for 30 days post
            cancellation, allowing you to export it before permanent deletion.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            9. How often is the software updated?
          </h4>
          <p className="text-content">
            We intent and shall be regularly updating our software’s, with
            patches and new features which shall be automatically rolled out.
            Users benefit from improvements without needing to manually install
            updates.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            10. Do you offer customer support?
          </h4>
          <p className="text-content">
            We offer various support options, including chat, email, phone
            support, and knowledge bases. We shall be offering premium instant
            support with faster response time soon.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            11. Is the software mobile-friendly?
          </h4>
          <p className="text-content">
            Our SaaS platform offers responsive web designs (mobile apps coming
            soon), allowing users to access the software on smartphones or
            tablets.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            12. What is uptime and how reliable is your service?
          </h4>
          <p className="text-content">
            Our companies offers guaranteed uptime in a Service Level Agreement
            (SLA). Typical guarantees are 99.9% uptime.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            13. Can I integrate with other tools?
          </h4>
          <p className="text-content">
            Our SaaS platform currently supports our proprietary tech and we
            shall soon be activating integrations with popular tools like CRM,
            accounting, and marketing platforms. We shall also be soon providing
            and offering API access for custom integrations.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            14. How do you handle backups and data recovery?
          </h4>
          <p className="text-content">
            We usually perform regular backups and have disaster recovery plans
            in place. We also offer data recovery options as part of their
            services.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            15. Is there a limit on the number of users?
          </h4>
          <p className="text-content">
            As of now there are no user limitation on our platform.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            16. Do you support CRM functionality?
          </h4>
          <p className="text-content">
            Yes, our platform includes a built-in Customer Relationship
            Management (CRM) system, enabling you to track leads, communicate
            with clients, and manage follow-ups efficiently.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            17. Can I manage multiple properties or agents from one account?
          </h4>
          <p className="text-content">
            Yes, our software allows you to manage multiple properties, agents,
            and offices from a single account. You can assign roles and
            permissions to team members and track their performance.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            18. What types of reports can I generate?
          </h4>
          <p className="text-content">
            You can generate various reports, including property performance,
            sales activity, lead tracking, sales progress, admin, financial
            reports etc. The reports are customizable and can be exported in
            multiple formats (PDF, Excel, etc.).
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            19. Do you offer training and support?
          </h4>
          <p className="text-content">
            Yes, we offer onboarding and training sessions to help you get the
            most out of the platform. Our support team is available via chat,
            email, and phone. We also provide a comprehensive knowledge base.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            20. Can I ask the support team any questions or request any
            customised requirement ?
          </h4>
          <p className="text-content">
            Yes, we are more than open to answer any of your questions and we
            shall try our best to provide you with customised solutions as well
            post our discussion.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            21. Where can I contact you?{" "}
          </h4>
          <p className="text-content">
            Write to us at{" "}
            <a
              className="WONOBLUE text-decoration-none"
              href="mailto:response@wono.co"
            >
              response@wono.co
            </a>{" "}
            and we shall try and get back to you asap.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            22. Are there any hidden charges?
          </h4>
          <p className="text-content">
            No, our SaaS is absolutely free for now.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            23. In which countries does WoNo provide its SaaS & Support?{" "}
          </h4>
          <p className="text-content">
            We offer our SaaS and Support across the world in all parts of the
            world.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            24. Can I apply to work or contribute at WoNo and join the
            revolution to support the Nomad Community & Ecosystem?
          </h4>
          <p className="text-content">
            Yes, we are more than happy to welcome all friends who want to join
            our company or contribute as freelancers. You can reach us at{" "}
            <a
              className="WONOBLUE text-decoration-none"
              href="mailto:hr@wono.co"
            >
              hr@wono.co
            </a>{" "}
            or apply from our careers age.
          </p>
        </div>
        <hr className="border-gray-300" />

        <div className="flex flex-col gap-4 my-4 font-sans">
          <h4 className="font-sans text-subtitle font-semibold">
            25. Can I connect with the Founders of the company?
          </h4>
          <p className="text-content">
            Yes, the founders of the company are more than open to have a
            virtual meeting with its well wishers and supporters. A meeting
            could be mutually organised once the support team does the initial
            meeting with you.
          </p>
        </div>
        <hr className="border-gray-300" />

        <p className="mt-16 mb-8">
          Can find the answer to any of your questions here? Please connect with
          us via our{" "}
          <Link className="text-primary-blue text-decoration-none" to="/contact">
            Contact us
          </Link>{" "}
          page.{" "}
        </p>
      </div>
    </div>
  );
};

export default HostFAQ;
