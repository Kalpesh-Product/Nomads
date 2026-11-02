import { useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import axios from "../utils/axios";
import { TextField } from "@mui/material";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import MuiModal from "./Modal";
import SecondaryButton from "./SecondaryButton";
import renderStars from "../utils/renderStarts";

const initials = (name = "") => name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2);
const buttonClass = "rounded-full bg-primary-blue px-5 py-2 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-50 disabled:cursor-wait";

function CommentEntry({ entry, children }) {
  return (
    <article className="flex gap-3">
      <div aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-blue text-xs font-semibold uppercase text-white">
        {initials(entry.authorName)}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-sm font-semibold text-gray-900">{entry.authorName}</p>
          <time dateTime={entry.createdAt} className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time>
        </div>
        {entry.starCount && <div className="flex gap-1" aria-label={`${entry.starCount} out of 5 stars`}>{renderStars(entry.starCount)}</div>}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{entry.text}</p>
        {children}
      </div>
    </article>
  );
}

export default function ArticleComments({ articleId, kind, title }) {
  const { auth } = useAuth();
  const client = useAxiosPrivate();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const formId = useId();
  const [page, setPage] = useState(1);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [starCount, setStarCount] = useState(5);
  const authorName = auth?.user?.fullName || auth?.user?.name || "Unknown User";
  const signedIn = !!(auth?.user?._id || auth?.user?.id);
  const endpoint = `/content-comments/${kind}/${articleId}`;
  const queryKey = ["articleComments", kind, articleId];
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [...queryKey, page],
    queryFn: async () => (await axios.get(endpoint, { params: { page } })).data,
  });
  const mutation = useMutation({
    mutationFn: async ({ body, commentId, rating }) => client.post(commentId ? `${endpoint}/${commentId}/replies` : endpoint, { text: body.trim(), ...(!commentId ? { starCount: rating } : {}) }),
    onSuccess: async (_, { commentId }) => {
      if (commentId) { setReplyText(""); setReplyTo(null); }
      else { setText(""); setStarCount(5); setCommentOpen(false); setPage(1); }
      setNotice(commentId ? "Reply posted." : "Comment posted.");
      await queryClient.invalidateQueries({ queryKey });
    },
  });
  const logIn = () => {
    const params = new URLSearchParams(location.search);
    params.set("id", articleId);
    navigate("/login", { state: { redirectTo: `${location.pathname}?${params}` } });
  };
  const submit = (event, commentId) => {
    event.preventDefault();
    if (!signedIn) return logIn();
    const body = commentId ? replyText : text;
    if (!body.trim() || mutation.isPending) return;
    setNotice("");
    mutation.mutate({ body, commentId, rating: starCount });
  };
  const renderReplyForm = () => (
    <form onSubmit={(event) => submit(event, replyTo)} className="space-y-3">
      <label htmlFor={`${formId}-reply`} className="block text-sm font-medium text-gray-800">Your reply</label>
      <textarea
        id={`${formId}-reply`}
        value={replyText}
        onChange={(event) => setReplyText(event.target.value)}
        required maxLength={2000} rows={3} disabled={mutation.isPending}
        placeholder="Write your reply…"
        className="block w-full resize-y rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-800 focus:border-primary-blue focus:outline-none focus:ring-1 focus:ring-primary-blue"
      />
      <div className="flex items-center gap-3">
        <button type="submit" className={buttonClass} disabled={mutation.isPending || !replyText.trim()}>{mutation.isPending ? "Posting…" : "Post reply"}</button>
        <button type="button" disabled={mutation.isPending} onClick={() => { setReplyTo(null); setReplyText(""); mutation.reset(); }} className="text-sm text-gray-600 hover:underline">Cancel</button>
      </div>
    </form>
  );

  return (
    <section aria-labelledby={`${formId}-heading`} className="border-b border-gray-200 py-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id={`${formId}-heading`} className="text-subtitle font-semibold text-gray-900">Comments{data ? ` (${data.total})` : ""}</h2>
        {data?.total > 0 && Number.isFinite(data?.averageRating) && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900" aria-label={`Average rating: ${data.averageRating.toFixed(1)} out of 5`}>
            <AiFillStar size={16} aria-hidden="true" />
            {data.averageRating.toFixed(1)} / 5
          </span>
        )}
      </div>
      {mutation.isError && !commentOpen && <p role="alert" className="text-sm text-red-600">{mutation.error?.response?.data?.message || "Unable to post. Please try again."}</p>}
      <p role="status" className="text-sm text-gray-600">{notice}</p>
      {isPending ? <p role="status" className="text-sm text-gray-500">Loading comments…</p> : isError ? (
        <p role="alert" className="text-sm text-gray-600">Unable to load comments. <button type="button" onClick={() => refetch()} className="text-primary-blue hover:underline">Try again</button></p>
      ) : data?.data?.length === 0 ? <p className="text-sm text-gray-500">No comments yet. Be the first to share your thoughts.</p> : (
        <div className="space-y-7">
          {data?.data?.map((comment) => (
            <CommentEntry key={comment._id} entry={comment}>
              <button type="button" disabled={mutation.isPending} onClick={() => { if (!signedIn) return logIn(); setReplyTo(comment._id); setReplyText(""); mutation.reset(); setNotice(""); }} className="text-xs font-medium text-primary-blue hover:underline">Reply</button>
              {comment.replies?.length > 0 && <div className="space-y-5 border-l border-gray-200 pl-3 pt-3 sm:pl-5">{comment.replies.map((reply) => <CommentEntry key={reply._id} entry={reply} />)}</div>}
              {replyTo === comment._id && <div className="pt-3">{renderReplyForm()}</div>}
            </CommentEntry>
          ))}
        </div>
      )}
      {data?.totalPages > 1 && <div className="flex items-center justify-between gap-3 text-sm">
        <button type="button" disabled={page === 1 || mutation.isPending} onClick={() => { setPage(page - 1); setReplyTo(null); }} className="text-primary-blue disabled:text-gray-400">Newer comments</button>
        <span className="text-gray-500">Page {page} of {data.totalPages}</span>
        <button type="button" disabled={page >= data.totalPages || mutation.isPending} onClick={() => { setPage(page + 1); setReplyTo(null); }} className="text-primary-blue disabled:text-gray-400">Older comments</button>
      </div>}
      <div className="flex justify-center">
        <button type="button" onClick={() => {
          if (!signedIn) return logIn();
          mutation.reset(); setNotice(""); setReplyTo(null); setCommentOpen(true);
        }} className="flex rounded-full items-center cursor-pointer justify-center gap-2 bg-primary-blue hover:bg-secondary-light text-primary text-content leading-5 px-6 py-3">
          WRITE A COMMENT
        </button>
      </div>
      <MuiModal open={commentOpen} onClose={() => { if (!mutation.isPending) setCommentOpen(false); }} title={title || "Write a comment"}>
        <form onSubmit={(event) => submit(event)} className="grid grid-cols-1 gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-blue text-2xl font-semibold uppercase text-white">{initials(authorName)}</div>
            <p className="text-card-title font-semibold text-gray-900">{authorName}</p>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button key={rating} type="button" disabled={mutation.isPending} onClick={() => setStarCount(rating)} className="transition-transform hover:scale-105" aria-label={`Rate ${rating} star`} aria-pressed={starCount === rating}>
                {rating <= starCount ? <AiFillStar size={56} className="text-yellow-400" /> : <AiOutlineStar size={56} className="text-gray-300" />}
              </button>
            ))}
          </div>
          <TextField
            value={text} onChange={(event) => setText(event.target.value)}
            placeholder={`Share your thoughts on this ${kind === "news" ? "news article" : "blog"}`}
            fullWidth variant="standard" size="small" multiline minRows={3} required disabled={mutation.isPending}
            slotProps={{ htmlInput: { maxLength: 2000, "aria-label": "Comment details" } }}
          />
          {mutation.isError && <p role="alert" className="text-sm text-red-600">{mutation.error?.response?.data?.message || "Unable to post. Please try again."}</p>}
          <div className="flex justify-center">
            <SecondaryButton title="Submit Comment" type="submit" externalStyles="mt-4" disabled={mutation.isPending || !text.trim()} isLoading={mutation.isPending} />
          </div>
        </form>
      </MuiModal>
    </section>
  );
}
