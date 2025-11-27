from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def get_page_source(url, required_div_id, use_undetected=False, scroll_to_bottom=False):
    """Fetch page source for `url` and wait for an element with `required_div_id`.

    This function initializes `driver` lazily and ensures `driver.quit()` is only
    called when a driver instance was created to avoid UnboundLocalError when
    driver initialization fails (e.g., missing browser binary).
    """
    driver = None
    try:
        if use_undetected:
            try:
                driver = __init_undetected_driver()
            except Exception as e:
                print(
                    "Failed to initialize undetected_chromedriver:\n",
                    e,
                    "\nFalling back to standard Chrome driver."
                )
                driver = __init_driver()
        else:
            driver = __init_driver()

        driver.get(url)
        if scroll_to_bottom:
            # Scroll to the bottom of the page to ensure all content is loaded
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, required_div_id))
        )
        return driver.page_source
    except Exception as e:
        print(f"Error fetching the URL: {e}")
        return None
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                # ignore errors on quit
                pass

def __init_driver():
    """Initialize and return a headless Chrome WebDriver."""
    options = Options()
    options.headless = True
    options.add_argument("--headless=new")
    options.add_argument("--log-level=3")
    return webdriver.Chrome(options=options)

def __init_undetected_driver():
    """Initialize and return an undetected Chrome WebDriver.

    This lazily imports `undetected_chromedriver` and allows the caller to
    provide the path to a browser binary via the `CHROME_BINARY` environment
    variable if the system default can't be found.
    """
    try:
        import undetected_chromedriver as uc
    except Exception as e:
        raise RuntimeError(
            "undetected_chromedriver is not available in this environment. "
            "Install it or run without use_undetected=True."
        ) from e

    options = uc.ChromeOptions()
    options.add_argument("start-maximized")
    options.headless = True
    options.add_argument("--log-level=3")

    # Allow overriding binary location via environment variable
    import os

    chrome_bin = os.environ.get("CHROME_BINARY") or os.environ.get("CHROME_BIN")
    if chrome_bin:
        options.binary_location = chrome_bin

    try:
        return uc.Chrome(options=options)
    except Exception as e:
        # Re-raise with clearer context
        raise RuntimeError(
            "Failed to start undetected_chromedriver. Ensure Chrome/Chromium is installed "
            "and the binary location is correct. See CHROME_BINARY env var."
        ) from e