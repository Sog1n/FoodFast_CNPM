class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;      // Mongoose query (vd: Restaurant.find())
    this.queryStr = queryStr; // Query string từ request (req.query)
  }

  // 🔍 Tìm kiếm theo keyword (theo tên)
  search() {
    const keyword = this.queryStr.keyword
        ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i", // không phân biệt hoa thường
          },
        }
        : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  // 🔎 Lọc theo điều kiện (price, ratings, ...), đồng thời hỗ trợ sort
  filter() {
    const queryObj = { ...this.queryStr };
    const excludeFields = ["keyword", "sortBy", "page"];
    excludeFields.forEach((el) => delete queryObj[el]);

    // Hỗ trợ toán tử Mongo (gt, gte, lt, lte)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    // Sắp xếp (nếu có sortBy trong query)
    if (this.queryStr.sortBy) {
      const sortKey = this.queryStr.sortBy.toLowerCase();
      let sortQuery = {};
      if (sortKey === "ratings") sortQuery = { ratings: -1 };
      else if (sortKey === "reviews") sortQuery = { numOfReviews: -1 };

      this.query = this.query.sort(sortQuery);
    }

    return this;
  }

  // 📄 Phân trang
  pagination(resPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }

  // 📑 Chỉ sort (nếu chỉ muốn gọi riêng lẻ)
  sort() {
    if (this.queryStr.sortBy) {
      const sortKey = this.queryStr.sortBy.toLowerCase();
      let sortQuery = {};

      if (sortKey === "ratings") sortQuery = { ratings: -1 };
      else if (sortKey === "reviews") sortQuery = { numOfReviews: -1 };

      this.query = this.query.sort(sortQuery);
    }
    return this;
  }
}

module.exports = APIFeatures;
