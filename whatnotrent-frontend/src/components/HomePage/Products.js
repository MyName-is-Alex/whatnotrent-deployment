﻿import React, { useEffect, useState } from "react";
import Product from "./Product";
import Loading from "../Loading";
import authHeader from "../api-authorization/authHeader";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import { Row } from "reactstrap";
import { ApiRoutes } from "../../ApiRoutes";

const Products = ({ categoryFilter, formTimeUnits, formCategories, sortByFilter, sortDirection, searchStr }) => {
    const [page, setPage] = useState(0);
    const [productList, setProductList] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setProductList([]);
        setHasMore(true);
        setPage(0);
        triggerScrollEvent();
    }, [categoryFilter, sortByFilter, sortDirection, searchStr]);

    return productList.loading ? (
        <Loading />
    ) : (
        renderProductsComponent(
            productList,
            setProductList,
            page,
            setPage,
            formTimeUnits,
            formCategories,
            hasMore,
            setHasMore,
            categoryFilter,
            sortByFilter,
            sortDirection,
            searchStr
        )
    );
};

const fetchPage = async (
    page,
    setPage,
    productList,
    setProductList,
    setHasMore,
    categoryFilter,
    sortByFilter,
    sortDirection,
    searchStr
) => {
    const apiRoute = !searchStr
        ? ApiRoutes.PageProducts(page, categoryFilter, sortByFilter, sortDirection)
        : ApiRoutes.PageProductsSearched(page, categoryFilter, sortByFilter, sortDirection, searchStr);

    const response = await axios.get(apiRoute, authHeader());
    const result = await response["data"];
    if (result.length === 0) {
        setHasMore(false);
        return;
    }
    await setProductList(productList.concat(result));

    setPage(page + 1);
};

const renderProductsComponent = (
    productList,
    setProductList,
    page,
    setPage,
    formTimeUnits,
    formCategories,
    hasMore,
    setHasMore,
    categoryFilter,
    sortByFilter,
    sortDirection,
    searchStr
) => {
    return (
        <>
            <InfiniteScroll
                dataLength={() => productList.length}
                next={() =>
                    fetchPage(
                        page,
                        setPage,
                        productList,
                        setProductList,
                        setHasMore,
                        categoryFilter,
                        sortByFilter,
                        sortDirection,
                        searchStr
                    )
                }
                hasMore={hasMore}
                loader={<Loading />}>
                <Row className={"container row justify-content-center mx-auto mb-5"}>
                    {productList.map((product) => (
                        <Product
                            key={product["id"]}
                            id={product["id"]}
                            title={product["name"]}
                            startDate={product["startDate"]}
                            endDate={product["endDate"]}
                            price={product["price"]}
                            unit={product["unit"]}
                            photo={product.photos[0].photoUrl}
                            timeUnit={formTimeUnits[product["unit"]]}
                            category={formCategories[product["category"]["id"] - 1]}
                        />
                    ))}
                </Row>
            </InfiniteScroll>
        </>
    );
};

function triggerScrollEvent() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("scroll"));
    }
}

export default Products;
