test:
		@node node_modules/lab/bin/lab -L
test-cov:
		@node node_modules/lab/bin/lab -c -L -r lcov -o lcov.info
test-cov-html:
		@node node_modules/lab/bin/lab -r html -o coverage.html

.PHONY: test test-cov test-cov-html
