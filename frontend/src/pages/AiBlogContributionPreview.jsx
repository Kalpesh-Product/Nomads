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

const buildFormState = (blog = {}) => ({
  destination: blog.destination || "",
  link: blog.link || blog.blogType || "",
  mainTitle: blog.mainTitle || "",
  mainImage: blog.mainImage || "",
  author: blog.author || "",
  source: typeof blog.source === "object" ? blog.source?.name || "" : blog.source || "",
  date: toDateInputValue(blog.date),
  mainContent: blog.mainContent || "",
  sections:
    Array.isArray(blog.sections) && blog.sections.length > 0
      ? blog.sections.map((section) => ({
          title: section.title || "",
          image: section.image || "",
          content: section.content || "",
        }))
      : [emptySection()],
});

const FloatingImage = ({ src, alt, side = "right" }) => {
  if (!src) return null;

  const floatClasses =
    side === "left" ? "md:float-left md:mr-8" : "md:float-right md:ml-8";

  return (
    <div className={`mb-5 h-auto w-full overflow-hidden rounded-xl md:mb-3 md:w-[38%] lg:w-[36%] ${floatClasses}`}>
      <img src={src} alt={alt} className="block h-auto w-full" />
    </div>
  );
};

const BlogPreview = ({ blog, onEdit }) => {
  let sectionImageIndex = 0;
  const sections = (blog.sections || []).map((section) => {
    if (!section.image) return { ...section, imageSide: null };
    const imageSide = sectionImageIndex % 2 === 0 ? "left" : "right";
    sectionImageIndex += 1;
    return { ...section, imageSide };
  });

  return (
    <div className="mx-auto w-full max-w-[80rem] px-1 pb-10 pt-4 md:px-6 lg:px-0">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-sm font-semibold text-black/50">Blog Preview</h1>
          <p className="text-xs font-medium capitalize text-slate-500">
            Status: {blog.status || "pending"}
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

      <div className="flex flex-col gap-8">
        <section className="clear-both flow-root">
          <h2 className="mb-8 text-title font-bold leading-normal">
            {blog.mainTitle || "Untitled Blog"}
          </h2>
          <FloatingImage src={blog.mainImage} alt={blog.mainTitle || "Blog image"} />
          <p className="whitespace-pre-line leading-relaxed">
            {String(blog.mainContent || "").trimStart()}
          </p>
        </section>

        {sections.length > 0 ? (
          <>
            <hr />
            <section className="flex flex-col gap-8">
              {sections.map((section, index) => (
                <article key={`${section.title || "section"}-${index}`} className="clear-both flow-root">
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
          <p className="w-full break-words md:w-auto">{blog.author || ""}</p>
          <p className="w-full break-words md:w-auto">{humanDate(blog.date || blog.updatedAt)}</p>
          <p className="w-full break-words md:w-auto md:text-right">
            {typeof blog.source === "object"
              ? blog.source?.name || "Source"
              : blog.source || "Source"}
          </p>
        </footer>
      </div>
    </div>
  );
};

const BlogEditForm = ({ blog, onCancel }) => {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(() => buildFormState(blog));
  const blogId = blog._id || blog.id;

  const updateBlogMutation = useMutation({
    mutationFn: async ({ payload }) => axiosPrivate.patch(`/blogs/my/${blogId}`, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["myBlogContributions"] });
      await showSuccessAlert("Blog updated successfully.", {
        title: "Blog Updated",
      });
      navigate("/blog-contributions");
    },
    onError: (error) => {
      showErrorAlert(
        error?.response?.data?.message ||
          "Could not update this blog. Please check the details and try again.",
      );
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

    if (!formValues.mainTitle.trim()) {
      showErrorAlert("Main title is required.");
      return;
    }

    if (!formValues.mainContent.trim()) {
      showErrorAlert("Main content is required.");
      return;
    }

    updateBlogMutation.mutate({
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

  const isSaving = updateBlogMutation.isPending;

  return (
    <main className="mx-auto w-full max-w-[74rem] px-1 pb-8 pt-2 md:px-6 lg:px-0">
      <section className="mt-3 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-2xl font-semibold uppercase text-slate-700">
            Edit Blog
          </h1>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className={labelClassName}>Destination</label>
              <input className={inputClassName} value={formValues.destination} readOnly />
            </div>
            <div>
              <label className={labelClassName}>Link</label>
              <input
                className={inputClassName}
                value={formValues.link}
                onChange={(event) => updateFormField("link", event.target.value)}
                placeholder="Type URL here"
              />
            </div>
            <div>
              <label className={labelClassName}>Main Title</label>
              <input
                className={inputClassName}
                value={formValues.mainTitle}
                onChange={(event) => updateFormField("mainTitle", event.target.value)}
                placeholder="Main title"
              />
            </div>
            <div>
              <label className={labelClassName}>Main Image URL</label>
              <input
                className={inputClassName}
                value={formValues.mainImage}
                onChange={(event) => updateFormField("mainImage", event.target.value)}
                placeholder="Main image URL"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelClassName}>Author</label>
              <input
                className={inputClassName}
                value={formValues.author}
                onChange={(event) => updateFormField("author", event.target.value)}
                placeholder="Author"
              />
            </div>
            <div>
              <label className={labelClassName}>Source</label>
              <input
                className={inputClassName}
                value={formValues.source}
                onChange={(event) => updateFormField("source", event.target.value)}
                placeholder="Source"
              />
            </div>
            <div>
              <label className={labelClassName}>Date</label>
              <input
                className={inputClassName}
                type="date"
                value={formValues.date}
                onChange={(event) => updateFormField("date", event.target.value)}
              />
            </div>
            <div>
              <label className={labelClassName}>Status</label>
              <input className={inputClassName} value="Pending review after save" readOnly />
            </div>
          </div>

          <div className="mt-6">
            <label className={labelClassName}>Main Content</label>
            <textarea
              className={`${inputClassName} min-h-[150px] resize-y leading-relaxed`}
              value={formValues.mainContent}
              onChange={(event) => updateFormField("mainContent", event.target.value)}
              placeholder="Main content"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-700">Sections</h2>
          <div className="mt-3 space-y-4">
            {formValues.sections.map((section, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
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
                  <div>
                    <label className={labelClassName}>Section Title</label>
                    <input
                      className={inputClassName}
                      value={section.title}
                      onChange={(event) => updateSection(index, "title", event.target.value)}
                      placeholder="Section Title"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Section Image URL</label>
                    <input
                      className={inputClassName}
                      value={section.image}
                      onChange={(event) => updateSection(index, "image", event.target.value)}
                      placeholder="Section Image URL"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Section Content</label>
                    <textarea
                      className={`${inputClassName} min-h-[150px] resize-y leading-relaxed`}
                      value={section.content}
                      onChange={(event) => updateSection(index, "content", event.target.value)}
                      placeholder="Section content"
                    />
                  </div>
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
              Publish Blog
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

const AiBlogContributionPreview = () => {
  const { blogId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const stateBlog = location.state?.content;

  useEffect(() => {
    if (!auth?.user) {
      navigate("/login", {
        replace: true,
        state: { redirectTo: `/blog-contributions/${blogId}` },
      });
    }
  }, [auth?.user, blogId, navigate]);

  const {
    data: blogs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myBlogContributions", auth?.user?._id || auth?.user?.id],
    queryFn: async () => {
      const response = await axiosPrivate.get("/blogs/my");
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: Boolean(auth?.user),
    staleTime: 1000 * 60,
  });

  const blog = useMemo(() => {
    if (stateBlog && (stateBlog._id === blogId || stateBlog.id === blogId)) {
      return stateBlog;
    }

    return blogs.find((item) => item._id === blogId || item.id === blogId);
  }, [blogId, blogs, stateBlog]);

  if (!auth?.user) {
    return null;
  }

  if (isLoading && !blog) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-1 py-10 text-center text-sm text-slate-500 md:px-6 lg:px-0">
        Loading blog preview...
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-1 py-10 text-center md:px-6 lg:px-0">
        <p className="text-sm text-red-500">Could not load this blog contribution.</p>
        <button
          type="button"
          onClick={() => navigate("/blog-contributions")}
          className="mt-4 rounded-full bg-primary-blue px-5 py-2 text-sm font-semibold text-white"
        >
          Back to Blog Contributions
        </button>
      </div>
    );
  }

  return isEditing ? (
    <BlogEditForm blog={blog} onCancel={() => setIsEditing(false)} />
  ) : (
    <BlogPreview blog={blog} onEdit={() => setIsEditing(true)} />
  );
};

export default AiBlogContributionPreview;
