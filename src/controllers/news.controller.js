import {
  createService,
  findALLService,
  countNewsService,
  topNewsService,
  findNewsByIDService,
  SearchByTitleService,
  NewsByUserService,
  NewsUpdateService,
  NewsDeleteService,
} from "../services/news.service.js";

export const NewsCreate = async (req, res) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.send(401);
    }

    const parts = authorization.split(" ");

    if (parts.length !== 2) {
      return res.send(401);
    }

    const [schema, token] = parts;

    if (schema !== "Bearer") {
      return res.send(401);
    }

    const { title, text, banner } = req.body;

    if (!title || !text || !banner) {
      return res
        .status(400)
        .send({ message: "Submit all fields for registration" });
    }

    await createService({
      title,
      text,
      banner,
      user: req.userId,
    });

    res.send(201);
  } catch (e) {
    return res.status(404).send(e.message);
  }
};

export const NewsAll = async (req, res) => {
  try {
    let { limit, offset } = req.query;

    limit = Number(limit);
    offset = Number(offset);

    if (!limit) {
      limit = 5;
    }

    if (offset) {
      offset = 0;
    }

    const news = await findALLService(offset, limit);

    const total = await countNewsService();
    const currentURL = req.baseUrl;

    const next = offset + limit;
    const nextURL =
      next < total ? `${currentURL}?limit=${limit}&offset${next}` : null;

    const previous = offset - limit < 0 ? null : offset - limit;
    const previousURL =
      previous != null
        ? `${currentURL}?limit=${limit}&offset${previous}`
        : null;

    if (news.length === 0) {
      return res.status(400).send({
        message: "There are no registered news",
      });
    }

    res.send({
      nextURL,
      previousURL,
      limit,
      offset,
      total,
      results: news.map((newsIten) => ({
        id: newsIten._id,
        title: newsIten.title,
        text: newsIten.text,
        banner: newsIten.banner,
        likes: newsIten.likes,
        comments: newsIten.comments,
        name: newsIten.user.name,
        username: newsIten.user.username,
        userAvatar: newsIten.user.avatar,
      })),
    });
  } catch (e) {
    return res.status(404).send(e.message);
  }
};

export const NewsTop = async (req, res) => {
  try {
    const news = await topNewsService();

    if (!news) {
      return res.status(400).send({ message: "There is no registered post" });
    }

    res.send({
      news: {
        id: news._id,
        title: news.title,
        text: news.text,
        banner: news.banner,
        likes: news.likes,
        comments: news.comments,
        name: news.user.name,
        username: news.user.username,
      },
    });
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const NewsByID = async (rew, res) => {
  try {
    const { id } = rew.params;

    const news = await findNewsByIDService(id);

    res.send({
      news: {
        id: news._id,
        title: news.title,
        text: news.text,
        banner: news.banner,
        likes: news.likes,
        comments: news.comments,
        name: news.user.name,
        username: news.user.username,
      },
    });
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const NewsSearchByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    const news = await SearchByTitleService(title);

    if (news.length === 0) {
      return res
        .status(400)
        .send({ message: "There are not news with this title" });
    }

    res.send({
      results: news.map((newsIten) => ({
        id: newsIten._id,
        title: newsIten.title,
        text: newsIten.text,
        banner: newsIten.banner,
        likes: newsIten.likes,
        comments: newsIten.comments,
        name: newsIten.user.name,
        username: newsIten.user.username,
        userAvatar: newsIten.user.avatar,
      })),
    });
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const NewsByUser = async (req, res) => {
  try {
    const id = req.userId;

    const news = await NewsByUserService(id);

    res.send({
      results: news.map((newsIten) => ({
        id: newsIten._id,
        title: newsIten.title,
        text: newsIten.text,
        banner: newsIten.banner,
        likes: newsIten.likes,
        comments: newsIten.comments,
        name: newsIten.user.name,
        username: newsIten.user.username,
        userAvatar: newsIten.user.avatar,
      })),
    });
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const NewsUpdate = async (req, res) => {
  try {
    const { title, text, banner } = req.body;
    const { id } = req.params;

    if (!title && !banner && !text) {
      res.status(400).send({
        message: "Submit at least one field to update the post",
      });
    }

    const news = await findNewsByIDService(id);

    if (String(news.user._id) !== String(req.userId)) {
      return res.status(400).send({
        message: "You didn't update this post",
      });
    }

    await NewsUpdateService(id, title, text, banner);

    return res.send({ message: "Post successfully updated!" });
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const NewsDelete = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await findNewsByIDService(id);

    if (String(news.user._id) !== String(req.userId)) {
      return res.status(400).send({
        message: "You didn't delete this post",
      });
    }

    await NewsDeleteService(id);

    return res.send({ message: "Post successfilly delete" });
  } catch (e) {
    return res.status(400).send(e.message);
  }
};
