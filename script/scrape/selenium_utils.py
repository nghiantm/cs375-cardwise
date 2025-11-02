from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import undetected_chromedriver as uc

def get_page_source(url, required_div_id, use_undetected=False, scroll_to_bottom=False):
    try:
        if use_undetected:
            driver = __init_undetected_driver()
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
        driver.quit()

def __init_driver():
    """Initialize and return a headless Chrome WebDriver."""
    options = Options()
    options.headless = True
    options.add_argument("--headless=new")
    options.add_argument("--log-level=3")
    return webdriver.Chrome(options=options)

def __init_undetected_driver():
    """Initialize and return an undetected Chrome WebDriver."""
    options = uc.ChromeOptions()
    options.add_argument("start-maximized")
    options.headless = True
    options.add_argument("--log-level=3")
    return uc.Chrome(options=options)