import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import humanDate from "../utils/humanDate";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";

const inputClassName =
  "min-h-[42px] w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
const labelClassName = "mb-2 block text-xs font-semibold text-slate-600";

const contributionPreviewConfig = {
  blog: {
    label: "Blog",
    labelPlural: "Blog Contributions",
    dashboardPath: "/contributions/blog",
    myEndpoint: "/blogs/my",
    queryKey: "myBlogContributions",
    updateSuccessTitle: "Blog Updated",
    updateSuccessMessage: "Blog updated successfully.",
    errorMessage: "Could not update this blog. Please check the details and try again.",
    submitButtonLabel: "Publish Blog",
    previewType: "article",
  },
  news: {
    label: "News",
    labelPlural: "News Contributions",
    dashboardPath: "/contributions/news",
    myEndpoint: "/news/my",
    queryKey: "myNewsContributions",
    updateSuccessTitle: "News Updated",
    updateSuccessMessage: "News updated successfully.",
    errorMessage: "Could not update this news item. Please check the details and try again.",
    submitButtonLabel: "Publish News",
    previewType: "article",
  },
  event: {
    label: "Event",
    labelPlural: "Event Contributions",
    dashboardPath: "/contributions/event",
    myEndpoint: "/events/my",
    queryKey: "myEventContributions",
    updateSuccessTitle: "Event Updated",
    updateSuccessMessage: "Event updated successfully.",
    errorMessage: "Could not update this event. Please check the details and try again.",
    submitButtonLabel: "Publish Event",
    previewType: "destination",
    formType: "event",
  },
  places: {
    label: "Place",
    labelPlural: "Place Contributions",
    dashboardPath: "/contributions/places",
    myEndpoint: "/places/my",
    queryKey: "myPlaceContributions",
    updateSuccessTitle: "Place Updated",
    updateSuccessMessage: "Place updated successfully.",
    errorMessage: "Could not update this place. Please check the details and try again.",
    submitButtonLabel: "Publish Place",
    previewType: "destination",
    formType: "place",
  },
};

const emptySection = () => ({
  title: "",
  image: "",
  content: "",
});

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getSourceName = (source) =>
  typeof source === "object" ? source?.name || "" : source || "";

const buildFormState = (item = {}) => ({
  destination: item.destination || "",
  link: item.link || item.blogType || "",
  mainTitle: item.mainTitle || "",
  mainImage: item.mainImage || item.image || "",
  author: item.author || "",
  source: getSourceName(item.source),
  date: toDateInputValue(item.date),
  mainContent: item.mainContent || "",
  eventName: item.eventName || item.title || "",
  shortDescription: item.shortDescription || item.description || "",
  placeName: item.placeName || item.title || "",
  address: item.address || item.location || "",
  googleMapsLink: item.googleMapsLink || "",
  rating: item.rating || "",
  latitude: item.latitude ?? "",
  longitude: item.longitude ?? "",
  placeType: item.placeType || item.type || "",
  category: item.category || "",
  month: item.month || "",
  venue: item.venue || "",
  eventType: item.eventType || item.type || "",
  sections:
    Array.isArray(item.sections) && item.sections.length > 0
      ? item.sections.map((section) => ({
          title: section.title || "",
          image: section.image || "",
          content: section.content || "",
        }))
      : [emptySection()],
});

const Field = ({ label, children }) => (
  <div>
    <label className={labelClassName}>{label}</label>
    {children}
  </div>
);

const FloatingImage = ({ src, alt, side = "right" }) => {
  if (!src) return null;

  const floatClasses =
    side === "left" ? "md:float-left md:mr-8" : "md:float-right md:ml-8";

  return (
    <div
      className={`mb-5 h-auto w-full overflow-hidden rounded-xl md:mb-3 md:w-[38%] lg:w-[36%] ${floatClasses}`}
    >
      <img src={src} alt={alt} className="block h-auto w-full" />
    </div>
  );
};

const PreviewHeader = ({ config, item, onEdit }) => (
  <div className="mb-5 flex items-center justify-between gap-4">
    <div>
      <h1 className="text-sm font-semibold text-black/50">
        {config.label} Preview
      </h1>
      <p className="text-xs font-medium capitalize text-slate-500">
        Status: {item.status || "pending"}
      </p>
    </div>
    <button
      type="button"
      onClick={onEdit}
      className="inline-flex items-center gap-2 rounded-full bg-primary-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
    >
      <HiOutlinePencil size={16} />
      Edit
    </button>
  </div>
);

const ArticlePreview = ({ item, config, onEdit }) => {
  let sectionImageIndex = 0;
  const title = item.mainTitle || `Untitled ${config.label}`;
  const sections = (item.sections || []).map((section) => {
    if (!section.image) return { ...section, imageSide: null };
    const imageSide = sectionImageIndex % 2 === 0 ? "left" : "right";
    sectionImageIndex += 1;
    return { ...section, imageSide };
  });

  return (
    <div className="mx-auto w-full max-w-[80rem] px-4 pb-10 pt-4 md:px-8 lg:px-8">
      <PreviewHeader config={config} item={item} onEdit={onEdit} />

      <div className="flex flex-col gap-8">
        <section className="clear-both flow-root">
          <h2 className="mb-8 text-title font-bold leading-normal">{title}</h2>
          <FloatingImage src={item.mainImage} alt={title} />
          <p className="whitespace-pre-line leading-relaxed">
            {String(item.mainContent || "").trimStart()}
          </p>
        </section>

        {sections.length > 0 ? (
          <>
            <hr />
            <section className="flex flex-col gap-8">
              {sections.map((section, index) => (
                <article
                  key={`${section.title || "section"}-${index}`}
                  className="clear-both flow-root"
                >
                  {section.title ? (
                    <h3 className="mb-4 text-card-title font-bold leading-[1.2] md:leading-[1.35]">
                      {section.title}
                    </h3>
                  ) : null}
                  <FloatingImage
                    src={section.image}
                    alt={section.title || `Section ${index + 1}`}
                    side={section.imageSide}
                  />
                  {section.content ? (
                    <p className="whitespace-pre-line leading-relaxed">
                      {String(section.content || "").trimStart()}
                    </p>
                  ) : null}
                </article>
              ))}
            </section>
          </>
        ) : null}

        <hr />
        <footer className="flex w-full flex-col items-center gap-2 text-center text-sm md:flex-row md:items-center md:justify-between md:gap-4 md:text-left md:text-base">
          <p className="w-full break-words md:w-auto">{item.author || ""}</p>
          <p className="w-full break-words md:w-auto">
            {humanDate(item.date || item.updatedAt)}
          </p>
          <p className="w-full break-words md:w-auto md:text-right">
            {getSourceName(item.source) || "Source"}
          </p>
        </footer>
      </div>
    </div>
  );
};

const DestinationPreview = ({ item, config, onEdit }) => {
  const isEvent = config.formType === "event";
  const title = isEvent
    ? item.eventName || item.title || "Untitled Event"
    : item.placeName || item.title || "Untitled Place";
  const description = item.shortDescription || item.description || "";
  const image = item.mainImage || item.image;
  const primaryMeta = isEvent ? item.category : item.category || item.placeType;
  const centerMeta = isEvent ? item.month : item.rating || item.month;
  const rightMeta = isEvent ? item.venue : item.address || item.venue;

  return (
    <div className="mx-auto w-full max-w-[80rem] px-4 pb-10 pt-4 md:px-8 lg:px-8">
      <PreviewHeader config={config} item={item} onEdit={onEdit} />

      <section className="mt-4">
        <h2 className="text-title font-bold leading-normal">{title}</h2>
        {isEvent && item.month ? (
          <p className="mt-2 text-base font-medium text-black">
            During the month of {item.month}
          </p>
        ) : null}

        {image ? (
          <div className="mt-6 aspect-[3.3/1] w-full overflow-hidden rounded-xl bg-slate-100">
            <img src={image} alt={title} className="h-full w-full object-cover" />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 text-base font-bold text-black md:grid-cols-3">
          <p>{primaryMeta || ""}</p>
          <p className="md:text-center">{centerMeta || ""}</p>
          <p className="md:text-right">{rightMeta || ""}</p>
        </div>

        <hr className="my-6" />

        {description ? (
          <p className="whitespace-pre-line leading-relaxed">
            {String(description).trimStart()}
          </p>
        ) : null}

        {!isEvent && item.googleMapsLink ? (
          <a
            href={item.googleMapsLink}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex text-sm font-semibold text-primary-blue"
          >
            Open place link
          </a>
        ) : null}

        {isEvent && item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex text-sm font-semibold text-primary-blue"
          >
            Open event link
          </a>
        ) : null}
      </section>
    </div>
  );
};

const ArticleFields = ({ formValues, updateFormField }) => (
  <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
    <Field label="Author">
      <input
        className={inputClassName}
        value={formValues.author}
        onChange={(event) => updateFormField("author", event.target.value)}
        placeholder="Author"
      />
    </Field>
    <Field label="Source">
      <input
        className={inputClassName}
        value={formValues.source}
        onChange={(event) => updateFormField("source", event.target.value)}
        placeholder="Source"
      />
    </Field>
    <Field label="Date">
      <input
        className={inputClassName}
        type="date"
        value={formValues.date}
        onChange={(event) => updateFormField("date", event.target.value)}
      />
    </Field>
    <Field label="Status">
      <input className={inputClassName} value="Pending review after save" readOnly />
    </Field>
  </div>
);

const EventFields = ({ formValues, updateFormField }) => (
  <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
    {[
      ["Category", "category"],
      ["Month", "month"],
      ["Venue", "venue"],
      ["Type", "eventType"],
    ].map(([label, field]) => (
      <Field key={field} label={label}>
        <input
          className={inputClassName}
          value={formValues[field]}
          onChange={(event) => updateFormField(field, event.target.value)}
          placeholder={label}
        />
      </Field>
    ))}
  </div>
);

const PlaceFields = ({ formValues, updateFormField }) => (
  <>
    <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {[
        ["Address", "address"],
        ["Google Maps Link", "googleMapsLink"],
        ["Rating", "rating"],
        ["Type", "placeType"],
      ].map(([label, field]) => (
        <Field key={field} label={label}>
          <input
            className={inputClassName}
            value={formValues[field]}
            onChange={(event) => updateFormField(field, event.target.value)}
            placeholder={label}
          />
        </Field>
      ))}
    </div>

    <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
      {[
        ["Category", "category"],
        ["Month", "month"],
        ["Venue", "venue"],
        ["Latitude", "latitude"],
        ["Longitude", "longitude"],
      ].map(([label, field]) => (
        <Field key={field} label={label}>
          <input
            className={inputClassName}
            value={formValues[field]}
            onChange={(event) => updateFormField(field, event.target.value)}
            placeholder={label}
          />
        </Field>
      ))}
    </div>
  </>
);

const ContributionEditForm = ({ item, config, onCancel }) => {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(() => buildFormState(item));
  const itemId = item._id || item.id;
  const isEventForm = config.formType === "event";
  const isPlaceForm = config.formType === "place";
  const showSections = !isEventForm && !isPlaceForm;

  const updateContributionMutation = useMutation({
    mutationFn: async ({ payload }) =>
      axiosPrivate.patch(`${config.myEndpoint}/${itemId}`, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      await showSuccessAlert(config.updateSuccessMessage, {
        title: config.updateSuccessTitle,
      });
      navigate(config.dashboardPath);
    },
    onError: (error) => {
      showErrorAlert(error?.response?.data?.message || config.errorMessage);
    },
  });

  const updateFormField = (field, value) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSection = (index, field, value) => {
    setFormValues((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
      ),
    }));
  };

  const removeSection = (index) => {
    setFormValues((current) => ({
      ...current,
      sections:
        current.sections.length > 1
          ? current.sections.filter((_, sectionIndex) => sectionIndex !== index)
          : current.sections,
    }));
  };

  const handleSubmit = (isDraft) => {
    const cleanedSections = formValues.sections
      .map((section) => ({
        title: section.title.trim(),
        image: section.image.trim(),
        content: section.content.trim(),
      }))
      .filter((section) => section.title || section.image || section.content);

    if (isEventForm) {
      if (!formValues.eventName.trim()) {
        showErrorAlert("Event name is required.");
        return;
      }

      if (!formValues.shortDescription.trim()) {
        showErrorAlert("Short description is required.");
        return;
      }

      updateContributionMutation.mutate({
        payload: {
          eventName: formValues.eventName.trim(),
          shortDescription: formValues.shortDescription.trim(),
          mainImage: formValues.mainImage.trim(),
          destination: formValues.destination,
          link: formValues.link.trim(),
          category: formValues.category.trim(),
          month: formValues.month.trim(),
          venue: formValues.venue.trim(),
          eventType: formValues.eventType.trim(),
          sections: [],
          isDraft,
        },
      });
      return;
    }

    if (isPlaceForm) {
      if (!formValues.placeName.trim()) {
        showErrorAlert("Place name is required.");
        return;
      }

      if (!formValues.shortDescription.trim()) {
        showErrorAlert("Short description is required.");
        return;
      }

      updateContributionMutation.mutate({
        payload: {
          placeName: formValues.placeName.trim(),
          shortDescription: formValues.shortDescription.trim(),
          mainImage: formValues.mainImage.trim(),
          destination: formValues.destination,
          link: formValues.link.trim(),
          address: formValues.address.trim(),
          googleMapsLink: formValues.googleMapsLink.trim(),
          rating: formValues.rating.trim(),
          category: formValues.category.trim(),
          month: formValues.month.trim(),
          venue: formValues.venue.trim(),
          latitude: formValues.latitude,
          longitude: formValues.longitude,
          placeType: formValues.placeType.trim(),
          sections: [],
          isDraft,
        },
      });
      return;
    }

    if (!formValues.mainTitle.trim()) {
      showErrorAlert("Main title is required.");
      return;
    }

    if (!formValues.mainContent.trim()) {
      showErrorAlert("Main content is required.");
      return;
    }

    updateContributionMutation.mutate({
      payload: {
        mainTitle: formValues.mainTitle.trim(),
        mainImage: formValues.mainImage.trim(),
        mainContent: formValues.mainContent.trim(),
        author: formValues.author.trim(),
        date: formValues.date ? new Date(formValues.date).toISOString() : null,
        destination: formValues.destination,
        blogType: formValues.link.trim(),
        link: formValues.link.trim(),
        source: formValues.source.trim(),
        sections: cleanedSections,
        isDraft,
      },
    });
  };

  const isSaving = updateContributionMutation.isPending;

  return (
    <main className="mx-auto w-full max-w-[80rem] px-4 pb-8 pt-2 md:px-8 lg:px-8">
      <section className="mt-3 bg-transparent px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-2xl font-semibold uppercase text-slate-700">
            Edit {config.label}
          </h1>

          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Destination">
              <input className={inputClassName} value={formValues.destination} readOnly />
            </Field>
            <Field label="Link">
              <input
                className={inputClassName}
                value={formValues.link}
                onChange={(event) => updateFormField("link", event.target.value)}
                placeholder="Type URL here"
              />
            </Field>
            <Field
              label={
                isEventForm ? "Event Name" : isPlaceForm ? "Place Name" : "Main Title"
              }
            >
              <input
                className={inputClassName}
                value={
                  isEventForm
                    ? formValues.eventName
                    : isPlaceForm
                      ? formValues.placeName
                      : formValues.mainTitle
                }
                onChange={(event) =>
                  updateFormField(
                    isEventForm
                      ? "eventName"
                      : isPlaceForm
                        ? "placeName"
                        : "mainTitle",
                    event.target.value,
                  )
                }
                placeholder={
                  isEventForm
                    ? "Event name"
                    : isPlaceForm
                      ? "Place name"
                      : "Main title"
                }
              />
            </Field>
            <Field label="Main Image URL">
              <input
                className={inputClassName}
                value={formValues.mainImage}
                onChange={(event) => updateFormField("mainImage", event.target.value)}
                placeholder="Main image URL"
              />
            </Field>
          </div>

          {isEventForm ? (
            <EventFields formValues={formValues} updateFormField={updateFormField} />
          ) : isPlaceForm ? (
            <PlaceFields formValues={formValues} updateFormField={updateFormField} />
          ) : (
            <ArticleFields formValues={formValues} updateFormField={updateFormField} />
          )}

          <div className="mt-6">
            <label className={labelClassName}>
              {isEventForm || isPlaceForm ? "Short Description" : "Main Content"}
            </label>
            <textarea
              className={`${inputClassName} min-h-[150px] resize-y leading-relaxed`}
              value={
                isEventForm || isPlaceForm
                  ? formValues.shortDescription
                  : formValues.mainContent
              }
              onChange={(event) =>
                updateFormField(
                  isEventForm || isPlaceForm ? "shortDescription" : "mainContent",
                  event.target.value,
                )
              }
              placeholder={
                isEventForm || isPlaceForm ? "Short description" : "Main content"
              }
            />
          </div>

          {showSections ? (
            <>
              <h2 className="mt-5 text-lg font-semibold text-slate-700">Sections</h2>
              <div className="mt-3 space-y-4">
                {formValues.sections.map((section, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-medium text-slate-600">
                        Section {index + 1}
                      </h3>
                      {formValues.sections.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeSection(index)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                        >
                          <HiOutlineTrash size={14} />
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <Field label="Section Title">
                        <input
                          className={inputClassName}
                          value={section.title}
                          onChange={(event) =>
                            updateSection(index, "title", event.target.value)
                          }
                          placeholder="Section Title"
                        />
                      </Field>
                      <Field label="Section Image URL">
                        <input
                          className={inputClassName}
                          value={section.image}
                          onChange={(event) =>
                            updateSection(index, "image", event.target.value)
                          }
                          placeholder="Section Image URL"
                        />
                      </Field>
                      <Field label="Section Content">
                        <textarea
                          className={`${inputClassName} min-h-[150px] resize-y leading-relaxed`}
                          value={section.content}
                          onChange={(event) =>
                            updateSection(index, "content", event.target.value)
                          }
                          placeholder="Section content"
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormValues((current) => ({
                    ...current,
                    sections: [...current.sections, emptySection()],
                  }))
                }
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-800 hover:text-primary-blue"
              >
                <HiOutlinePlus size={16} />
                Add Section
              </button>
            </>
          ) : null}

          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Save As Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSaving}
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {config.submitButtonLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="rounded-lg bg-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-400 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

const AiBlogContributionPreview = ({ type = "blog" }) => {
  const params = useParams();
  const itemId = params.blogId || params.newsId || params.eventId || params.placeId;
  const location = useLocation();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const config = contributionPreviewConfig[type] || contributionPreviewConfig.blog;
  const stateItem = location.state?.content || location.state?.item;

  useEffect(() => {
    if (!auth?.user) {
      navigate("/login", {
        replace: true,
        state: { redirectTo: `${config.dashboardPath}/${itemId}` },
      });
    }
  }, [auth?.user, config.dashboardPath, itemId, navigate]);

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: [config.queryKey, auth?.user?._id || auth?.user?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get(config.myEndpoint);
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: Boolean(auth?.user),
    staleTime: 1000 * 60,
  });

  const item = useMemo(() => {
    if (stateItem && (stateItem._id === itemId || stateItem.id === itemId)) {
      return stateItem;
    }

    return items.find((entry) => entry._id === itemId || entry.id === itemId);
  }, [itemId, items, stateItem]);

  if (!auth?.user) {
    return null;
  }

  if (isLoading && !item) {
    return (
      <div className="mx-auto w-full max-w-[80rem] px-4 py-10 text-center text-sm text-slate-500 md:px-8 lg:px-8">
        Loading {config.label.toLowerCase()} preview...
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="mx-auto w-full max-w-[80rem] px-4 py-10 text-center md:px-8 lg:px-8">
        <p className="text-sm text-red-500">
          Could not load this {config.label.toLowerCase()} contribution.
        </p>
        <button
          type="button"
          onClick={() => navigate(config.dashboardPath)}
          className="mt-4 rounded-full bg-primary-blue px-5 py-2 text-sm font-semibold text-white"
        >
          Back to {config.labelPlural}
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <ContributionEditForm
        item={item}
        config={config}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return config.previewType === "destination" ? (
    <DestinationPreview item={item} config={config} onEdit={() => setIsEditing(true)} />
  ) : (
    <ArticlePreview item={item} config={config} onEdit={() => setIsEditing(true)} />
  );
};

export default AiBlogContributionPreview;
