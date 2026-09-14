package com.visualmerge.model;

public record Commit(String hash, String message, String author, String time) {}
